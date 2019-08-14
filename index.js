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

  // Push new subscriber to subscribers array
  Item.update(
    { name : req.body.itemName },
    { $addToSet : { "subscribers" : req.body.email } }) // Note: $push not used inorder to avoid duplicate email
    .then(item => {
      console.log("Subscriber SUCCESSFULLY added!");
    })
    .catch(err => {
      console.log("ERROR OCCURED DURING FINDANDUPDATE");
    });

  // TODO: SNED SUCCESSFUL MESSAGE TO CLIENT
  res.send("POST requested to page")
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

var isDebug = true;
var time = new Date();

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
          var priceText = $('#priceblock_ourprice').text();
          const priceElement = priceText ? priceText.slice(1, priceText.length) : 0;
          const productTitle = $('#productTitle').text().trim();
          const modelNumber = $('#productDetails_techSpec_section_2 > tbody > tr:nth-child(3) > td').text().trim();
          
          console.log(
            priceElement
              ? time.toLocaleString() + ': \'' + modelNumber + '\': ' + priceElement + 
                ' from ' + vendor.vendorName
              : time.toLocaleString() + ': \'' + modelNumber + '\'' + 
                ' price is currently not available from ' + vendor.vendorName);
          
          var isDeal = evalPrice(priceElement, item.meanPrice);

          if (isDeal) {
            // await email.sendEmail(vendor.url).catch(console.error);
            console.log('Sending email to subscribers.');
          }
          
          updatePrice(item, vendor, priceElement);
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

function updatePrice(item, vendor, newPrice) {
  if (!newPrice) {
    console.log(time.toLocaleString() + ': \'' + item.modelNumber + '\'' + 
    ' price is cannot be updated.');
    return;
  }
  var newMeanPrice = (parseFloat(newPrice) + (parseFloat(item.meanPrice ? item.meanPrice : 0) * parseFloat(item.meanCount))) / (parseFloat(item.meanCount) + 1.0);
  console.log(isDebug ? item : '');
  console.log('parseFloat(newPrice): ' + parseFloat(newPrice));
  console.log('parseFloat(newMeanPrice): ' + parseFloat(newMeanPrice));
  console.log('parseFloat(item.meanPrice ? item.meanPrice : 0): ' + parseFloat(item.meanPrice ? item.meanPrice : 0));
  console.log('item.meanCount: ' + parseInt(item.meanCount));
  console.log('item.meanCount + 1: ' + (parseInt(item.meanCount) + 1));
  Item.updateOne(
    { 'modelNumber' : item.modelNumber, 'vendors.name' : vendor.name }, 
    { $set : { 
      'meanPrice' : parseFloat(newMeanPrice), 
      'meanCount' : parseInt(item.meanCount) + 1,
      'vendors.$.currentPrice' : newPrice }})
    .then(val => {
      console.log(time.toLocaleString() + ': ' + item.modelNumber + ' mean price is updated to $' + newMeanPrice)})
      // console.log(val)})
    .catch(err => {
      console.log(time.toLocaleString() + ': ' + err + ' error updating item price.');
  });
}
// TODO: change DB field names
// db.items.update({}, {$rename:{avgPrice:"meanPrice"}}, { upsert:false, multi:true });
// db.items.update({}, {$rename:{avgCount:"meanCount"}}, { upsert:false, multi:true });
// db.items.updateMany( {}, { $rename: { vendors.currentPrice: "vendors.lastPrice" } } )
// db.items.update({}, {$rename:{vendors.currentPrice:"vendors.lastPrice"}}, { upsert:false, multi:true });