const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const axios = require('axios');
const cheerio = require('cheerio');
const { ensureNotAuthenticated, ensureAuthenticated } = require('../config/auth');



// POST request to subscribe
router.post('/subscribe', (req, res) => {
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
            console.log(`${req.body.email} successfully subscribed to ${req.body.itemName}`);
          })
          .catch(err => {
            console.log('Error occured during subscribe update');
          });
      }

      res.send({ isSubscribed: isSubscribed })
    })
    .catch(err => {
      console.log('Error occured during subscribe find');
    });
});

// POST request to unsubscribe
router.post('/unsubscribe', (req, res) => {
  Item.findOne({ name: req.body.itemName })
    .then(item => {
      let isUnsubscribed = true;
      // Push new subscriber to subscribers array
      item.updateOne(
        { $pull: { "subscribers": req.body.email } })
        .then(item => {
          isUnsubscribed = false;
          res.send({ isUnsubscribed: isUnsubscribed })
          console.log(`${req.body.email} successfully unsubscribed from ${req.body.itemName}`);
        })
        .catch(err => {
          console.log('Error occured during unsubscribe update');
        });
    })
    .catch(err => {
      console.log('Error occured during unsubscribe find');
    });
});

// POST request to add item
router.post('/addURL', ensureAuthenticated, (req, res) => {
  //console.log('POST RUEQUEST MADE');
  // TODO: perform initial scraping and insert to db
  Item.findOne({ 'vendors.url': { $in: req.body.url } }, async function (err, item) {
    if (err) {
      console.log(`Error occured during adding URL: ${req.body.url}`);
    }
    if (!item) {
      //console.log('URL not exist, need to be scraped');
      const errorMessage = await scrapeItem(req.body.url, req.body.email).catch(err => { console.log(err) });
      //console.log(errorMessage);
      res.send({ errorMessage: errorMessage });

    } else {
      res.send({ duplicateMessage: "Duplicate item! We already have this item on our list." });
    }
  }).catch(err => { console.log(err) });
});

scrapeItem = async (url, email) => {
  // Get capitalized vendor name
  let vendor = url.split('.')[1];
  vendor = vendor.charAt(0).toUpperCase() + vendor.slice(1);

  // Check vendor; Currently only Amazon is available
  if (vendor !== "Amazon")
    return "Currently our website only support Amazon vendor.";

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) '
    + 'Chrome/75.0.3770.100 Safari/537.36';

  // Initial scraping for given URL
  const response = await axios.get(url, {
    headers: {
      'User-Agent': userAgent
    }
  }).catch(err => console.log(err));

  // Check status of scraping
  if (response.status !== 200) {
    console.log('Error occured during scraping a given URL');
    return "Error occured during adding item.";
  }

  const rawHTML = response.data;
  const $ = cheerio.load(rawHTML);
  const isPCPart = $('#prodDetails > div > div:nth-child(1) > div.a-row.a-spacing-base > div > div.a-row > div > h1').text().trim();

  // Check if URL item is a pc part
  if (isPCPart !== "Technical Details")
    return "Provided URL is not a PC part.";

  // Scrape necessary data
  let priceText = $('#priceblock_ourprice').text();
  const priceElement = priceText ? priceText.slice(1, priceText.length) : 0;
  const productTitle = $('#productTitle').text().trim();
  const imageURL = $('#altImages > ul > li:nth-child(1)').find('img').attr('src').trim(); // NOTE: img url selector is different from Linux and windows environment
  const modelNumber = $('th').filter(function () { return $(this).text().trim() === 'Item model number' }).next().text().trim();
  const availability = priceElement ? true : false;
  const meanCount = priceElement ? "1" : "0";

  // insert to DB
  const item = new Item({
    name: productTitle,
    modelNumber: modelNumber,
    vendors: [
      {
        vendorName: vendor,
        url: url,
        currentPrice: priceElement
      }
    ],
    subscribers: [email],
    imageURL: imageURL,
    meanPrice: priceElement,
    meanCount: meanCount,
    availability: availability
  });

  Item.insertMany([item]);
}

module.exports = router;
