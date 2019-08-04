const express = require("express");
//const path = require("path");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Item = require("./models/Item");
const db = require("./config/keys").MongoURI;
const cron = require("node-cron");
const email = require("./email");

// Set static public directory (for css/jquery/etc...)
app.use(express.static(__dirname + "/public"));

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Failed to connect: ", err));

// Get a product price from Amazon
function main() {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";

  // Query products from DB
  Item.find({})
    .then(async items => {
      // TODO: Need another loop for async call for all items. Currently only handle one item (items[0]);
      // NOTE: forEach is not async use for(of) or promise.all()
      // GET request to product page for all vendors
      for (vendor of items[0].vendors) {
        const response = await axios.get(vendor.url, {
          headers: {
            "User-Agent": userAgent
          }
        });

        if (response.status === 200) {
          // TODO: Need to consider things to scrape
          // Scrape price element from the response
          const rawHTML = response.data;
          const $ = cheerio.load(rawHTML);
          const priceElement = $("#priceblock_ourprice").text();
          console.log(priceElement);

          // TODO: Need to compare and update DB entry with scraped data

          // TODO Send email if price changed
          //await email.sendEmail(vendor.url).catch(console.error);
        }
      }
    })
    .catch(err => {
      throw err;
    });
}
main();

/* NOTE ABOUT CRON:
 * Second(0-59)
 * Minute(0-59)
 * Hour(0-23)
 * Day(1-31)
 * Month(1-12)
 * Day of Week(0-7) 0 and 7 is sunday
 */

// cron.schedule("0 0 */1 * * *", () => {
//  main().catch(console.error);
//  console.log("Scheduled task running every hour at 0 second and 0 minute.");
//});

// Index Route
app.get("/", (req, res) => {
  Item.find({})
    .then(items => {
      res.render("index.ejs", {
        items: items
      });
    })
    .catch(err => {
      throw err;
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
