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

// Middlewares for body-parser 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
let time = new Date();

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
            console.log(time.toLocaleString() + ': Response error: ' +
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
              ? time.toLocaleString() + ': \'' + modelNumber + '\': ' + priceElement +
              ' from ' + vendor.vendorName
              : time.toLocaleString() + ': \'' + modelNumber + '\'' +
              ' price is currently not available from ' + vendor.vendorName);

          // Evaluate deal and send email notification if the item is on deal.
          let isDeal = evalPrice(priceElement, item.meanPrice);
          if (isDeal && item.subscribers.length !== 0) {
            //await email.sendEmail(vendor.url, item).catch(console.error);
            console.log('Sending email to subscribers.');
          }

          let newMeanPrice = getMeanPrice(item, priceElement);
          // If there is no newMeanPrice, Availiability to out-of-stock
          if (!newMeanPrice) {
            updateAvailability(item);
          }
          isDebug && newMeanPrice ? printPrice(newMeanPrice, item.meanPrice, item.meanCount, newMeanPrice) : null;
          newMeanPrice ? updatePrice(item, vendor, newMeanPrice, newMeanPrice) : null;
        }
      }
    })
    .catch(err => {
      throw err;
    });
}

function evalPrice(newPrice, previousPrice) {
  // TODO: Could use a better algorithm here to justify a good deal
  if (!newPrice || !previousPrice || (parseFloat(newPrice) > parseFloat(previousPrice))) {
    return false;
  }
  return true;
}

// TODO: seems like we need to check if the price scraped is actually a new price
function getMeanPrice(item, newPrice) {
  if (!newPrice) {
    console.log(time.toLocaleString() + ': \'' + item.modelNumber + '\'' +
      ' price is cannot be updated.');
    return;
  }
  newPrice = parseFloat(newPrice).toFixed(2);
  let meanCount = parseInt(item.meanCount);
  let meanPrice = parseFloat(item.meanPrice ? item.meanPrice : 0).toFixed(2);
  return (parseFloat(parseFloat(newPrice) + parseFloat(meanPrice * meanCount)) / parseFloat(meanCount + 1)).toFixed(2);
}

function updatePrice(item, vendor, newPrice, newMeanPrice) {
  Item.updateOne(
    { 'modelNumber': item.modelNumber, 'vendors.name': vendor.name },
    {
      $set: {
        'meanPrice': parseFloat(newMeanPrice),
        'meanCount': parseInt(item.meanCount) + 1,
        'vendors.$.currentPrice': newPrice
      }
    })
    .then(val => {
      console.log(time.toLocaleString() + ': ' + item.modelNumber + ' mean price is updated to $' + newMeanPrice)
    })
    // console.log(val)})
    .catch(err => {
      console.log(time.toLocaleString() + ': ' + err + ' error updating item price.');
    });

  console.log('');
  return;
}

function printPrice(newPrice, meanPrice, meanCount, newMeanPrice) {
  console.log('newPrice: ' + newPrice);
  console.log('meanPrice: ' + parseFloat(meanPrice).toFixed(2));
  console.log('meanCount: ' + parseInt(item.meanCount).toFixed(2));
  console.log('meanPrice * meanCount: ' + parseFloat(meanPrice * meanCount).toFixed(2));
  console.log('newMeanPrice: ' + newMeanPrice);
  return;
}

function resetDbPrice() {
  Item.updateMany({},
    {
      $set: {
        'meanPrice': 0,
        'meanCount': 0,
        'vendors.$.currentPrice': 0
      }
    })
    .then(val => {
      console.log(time.toLocaleString() + ': ' + item.modelNumber + ' mean price is updated to $' + newMeanPrice)
    })
    // console.log(val)})
    .catch(err => {
      console.log(time.toLocaleString() + ': ' + err + ' error updating item price.');
    });
  return;
}

function updateAvailability(item) {
  Item.updateOne(
    { 'modelNumber': item.modelNumber },
    {
      $set: {
        'availability': false,
      }
    })
    .then(val => {
      console.log(time.toLocaleString() + ': ' + item.modelNumber + ' Availability updated to false')
    })
    // console.log(val)})
    .catch(err => {
      console.log(time.toLocaleString() + ': ' + err + ' error updating item availiability.');
    });
}