const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/auth');
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

if (env === 'dev') {
  // Set static public directory (for css/jquery/etc...)
  app.use(express.static(path.join(__dirname + '/public')));
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

// Router
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));


// POST request to subscribe
app.post('/subscribe', (req, res) => {
  Item.findOne({ name: req.body.itemName, subscribers: req.body.email })
    .then(item => {
      let isSubscribed = false;
      if (item) {
        isSubscribed = true;
      } else {
        // Push new subscriber to subscribers array
        Item.updateOne(
          { name: req.body.itemName },
          { $addToSet: { "subscribers": req.body.email } }) // Note: $push not used inorder to avoid duplicate email
          .then(item => {
            console.log("Subscriber SUCCESSFULLY added!");
          })
          .catch(err => {
            console.log("ERROR OCCURED DURING FINDANDUPDATE");
          });
      }

      res.send({ isSubscribed: isSubscribed })
    })
    .catch(err => {
      console.log("Error occured during subscribe");
    });
});

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
          });

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
          // TODO: might be better to handle db's availability field is null
        }
      }
    })
    .catch(err => {
      throw err;
    });
}