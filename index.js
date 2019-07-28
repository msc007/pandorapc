const express = require("express");
const path = require("path");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Item = require("./models/Item");
const db = require("./config/keys").MongoURI;
// node cron for scedules execution
var cron = require('node-cron');

// Set static public directory (for css/jquery/etc...)
app.use(express.static(__dirname + "/public"));

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Failed to connect: ", err));

// Get a product price from Amazon
async function main() {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";

  // Query products from DB
  await Item.find({})
    .exec()
    .then(items => {
      items.forEach(item => {
        itemModel = item;
      });
      mongoose.connection.close();
    })
    .catch(err => {
      mongoose.connection.close();
      throw err;
    });

  // TODO: forEach is not async itselft might need to use "for(let vendor of itemModel.vendors)" or Promise.all()
  // GET request to product page for all vendors
  // await itemModel.vendors.forEach(async vendor => {
  for (vendor of itemModel.vendors) {
    const response = await axios.get(vendor.url, {
      headers: {
        "User-Agent": userAgent
      }
    });
    // Scrape price element from the response
    const rawHTML = response.data;
    const $ = cheerio.load(rawHTML);
    const priceElement = $("#priceblock_ourprice").text();
    console.log(priceElement);
  }
}

cron.schedule('10 0-24 * * *', () => {
  main().catch(console.error);
  console.log('Scheduled task running every hour.');
});

// Index Route
app.get("/", (req, res) => {
  // TODO: Need to handle multiple items
  Item.find({})
    .exec()
    .then(items => {
      items.forEach(item => {
        itemModel = item;
      });
      mongoose.connection.close();
    })
    .catch(err => {
      mongoose.connection.close();
      throw err;
    });

  res.render("index.ejs", {
    itemModel: itemModel
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
