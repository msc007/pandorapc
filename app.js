const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);
const app = express();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Item = require('./models/Item');
const db = require('./config/keys').MongoURI;
const cron = require('node-cron');
const email = require('./email');
const priceUtils = require('./priceUtils');
const env = process.env.NODE_ENV || 'dev';

// Set static public directory
if (env === 'dev') {
  console.log("DEV Environment");
  app.use(express.static(path.join(__dirname + '/public')));
  app.use('/users', express.static(path.join(__dirname + '/public')));
}

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Failed to connect: ', err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//No Cache - solve back button problem
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

// Router
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/items', require('./routes/items'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

let isDebug = true;

main();

/* NOTE ABOUT CRON:
 * Second(0-59)
 * Minute(0-59)
 * Hour(0-23)
 * Day(1-31)
 * Month(1-12)
 * Day of Week(0-7) 0 and 7 is sunday
 */

// cron.schedule('0 0 */1 * * *', () => {
//  time = new Date();
//  main();
//  console.log('\nScheduled task running every hour at 0 second and 0 minute.');
//});

// Get a product price from Amazon
function main() {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/75.0.3770.100 Safari/537.36';

  // Query products from DB
  Item.find({})
    .then(async items => {
      // NOTE: forEach is not async use for(of) or promise.all()
      for (item of items) {
        // console.log(isDebug ? item : '');
        for (vendor of item.vendors) {
          const response = await axios.get(vendor.url, {
            headers: {
              'User-Agent': userAgent
            }
          }).catch(err => console.log(err));

          if (!response) {
            console.log("Error getting response");
            continue;
          }
          if (response.status !== 200) {
            console.log(new Date().toLocaleString() + ': Response error: ' +
              renponse.status + ' from ' + vendor.vendorName + ' for item ' + item.name);
            continue;
          }

          const rawHTML = response.data;
          const $ = cheerio.load(rawHTML);
          let priceText = $('#priceblock_ourprice').text();
          const priceElement = priceText ? priceText.slice(1, priceText.length) : 0;
          const productTitle = $('#productTitle').text().trim();
          const modelNumber = $('#productDetails_techSpec_section_2 > tbody > tr:nth-child(3) > td').text().trim();

          console.log(
            priceElement
              ? new Date().toLocaleString() + ': \'' + modelNumber + '\': ' + priceElement +
              ' from ' + vendor.vendorName
              : new Date().toLocaleString() + ': \'' + modelNumber + '\'' +
              ' price is currently not available from ' + vendor.vendorName);

          // Evaluate deal and send email notification if the item is on deal.
          let isDeal = priceUtils.evalPrice(priceElement, item.meanPrice);
          if (isDeal && item.subscribers.length !== 0) {
            //await email.sendEmail(vendor.url, item).catch(console.error);
            console.log('Sending email to subscribers.');
          }

          let newMeanPrice = priceUtils.getMeanPrice(item, priceElement);
          isDebug && newMeanPrice ? priceUtils.printPrice(newMeanPrice, item.meanPrice, item.meanCount, newMeanPrice) : null;
          // If new meanprice exist update the price, otherwise change availiability to out-of-stock
          newMeanPrice ? Item.updatePrice(item, vendor, newMeanPrice, newMeanPrice) : Item.updateAvailability(item);
        }
      }
    })
    .catch(err => {
      throw err;
    });
}