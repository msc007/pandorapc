const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const Item = require('./models/Item');
const db = require('./config/keys').MongoURI;
const cron = require('node-cron');
const email = require('./email');

// Set static public directory (for css/jquery/etc...)
app.use(express.static(path.join(__dirname + '/public')));

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('Failed to connect: ', err));

// Index Route
app.get('/', (req, res) => {
  Item.find({})
    .then(items => {
      res.render('index.ejs', {
        items: items
      });
    })
    .catch(err => {
      throw err;
    });
});

// Subscribe
app.post('/subscribe', (req, res) => {
  res.send("POST requested to page")

});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

var debug_f = true;

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
//  main().catch(console.error);
//  console.log('Scheduled task running every hour at 0 second and 0 minute.');
//});

// Get a product price from Amazon
function main() {
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36';

  // Query products from DB
  Item.find({})
    .then(async items => {
      // NOTE: forEach is not async use for(of) or promise.all()
      // Send get request for items
      for (item of items) {

        // display current db item if check debug flag is set
        console.log(debug_f ? item : '');

        // Send request to product page for all vendors
        for (vendor of item.vendors) {
          const response = await axios.get(vendor.url, {
            headers: {
              'User-Agent': userAgent
            }
          });

          if (response.status === 200) {
            const rawHTML = response.data;
            const $ = cheerio.load(rawHTML);
            const priceElement = $('#priceblock_ourprice').text();
            const productTitle = $('#productTitle').text().trim();
            const modelNumber = $('#productDetails_techSpec_section_2').wrap();

            console.log
              (priceElement
                ? '\'' + productTitle + '\': ' + priceElement + ' from ' + vendor.vendorName
                : '\'' + productTitle + '\'' + ' price is currently not available' + ' from ' + vendor.vendorName);

            // console.log(debug_f ? productTitle : '');
          }
          else {
            console.log('Response error: ' + renponse.status + ' from ' + vendor.vendorName + ' for item ' + item.name);
          }
          // TODO: Need to compare and update DB entry with scraped data

          // Send email if price changed
          // await email.sendEmail(vendor.url).catch(console.error);
        }
      }
    })
    .catch(err => {
      throw err;
    });
}