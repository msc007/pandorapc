const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  _id: Schema.Types.ObjectId,
  URL: String
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
