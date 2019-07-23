const express = require("express");
const path = require("path");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");

const URL =
  "https://www.amazon.com/AMD-Ryzen-3700X-16-Thread-Processor/dp/B07SXMZLPK/ref=sr_1_1?keywords=ryzen+3900&qid=1563845675&s=gateway&sr=8-1";

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36";

async function main() {
  const response = await axios.get(URL, {
    headers: {
      "User-Agent": userAgent
    }
  });

  const rawHTML = response.data;
  const $ = cheerio.load(rawHTML);
  const priceElement = $("#priceblock_ourprice").text();
  console.log(priceElement);
}

main().catch(console.error);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on poart ${PORT}`));
