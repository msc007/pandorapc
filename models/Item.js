const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema for a item
const ItemSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  description: String,
  modelNumber: String,
  itemNumber: String,
  vendors: [
    {
      vendorName: String,
      url: String,
      currentPrice: String,
      prevPrice: String
    }
  ],
  subscribers: [String],
  meanPrice: String,
  meanCount: String,
  availability: Boolean,
});

/*
 * Note: Mongoose automatically looks for the plural, lowercased version of your model name.
 * i.e) Item -> items collection
 */
const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
