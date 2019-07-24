const express = require("express");
const path = require("path");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Item = require("./models/item");
const db = require("./config/keys").MongoURI;

//Connect to Mongo
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Failed to connect: ", err));

//Get a product price from Amazon
async function main() {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";

  // Query product links
  await Item.find({})
    .exec()
    .then(items => {
      items.forEach(item => {
        URL = item.URL;
      });
      mongoose.connection.close();
    })
    .catch(err => {
      mongoose.connection.close();
      throw err;
    });

  // GET request to product link
  const response = await axios.get(URL, {
    headers: {
      "User-Agent": userAgent
    }
  });

  // Scrap price element from the response
  const rawHTML = response.data;
  const $ = cheerio.load(rawHTML);
  const priceElement = $("#priceblock_ourprice").text();
  console.log(priceElement);
}

main().catch(console.error);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on poart ${PORT}`));
