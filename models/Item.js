const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema for a item
const ItemSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: { type: String, required: true },
  description: { type: String, default: "" },
  modelNumber: { type: String, default: "" },
  imageURL: { type: String },
  vendors: [
    {
      _id: false,
      vendorName: { type: String, required: true },
      url: { type: String, required: true },
      currentPrice: { type: String, required: true }
    }
  ],
  subscribers: [String],
  meanPrice: { type: String, required: true },
  meanCount: { type: String, required: true },
  availability: {
    type: Boolean,
    default: true
  }
}, { versionKey: false });

/* FUNCTIONS ItemSchema */
ItemSchema.statics.updatePrice = function (item, vendor, newPrice, newMeanPrice) {
  this.updateOne(
    { 'modelNumber': item.modelNumber, 'vendors.name': vendor.name },
    {
      $set: {
        'meanPrice': newMeanPrice,
        'meanCount': parseInt(item.meanCount) + 1,
        'vendors.$.currentPrice': newPrice,
        'availability': true
      }
    })
    .then(val => {
      console.log(new Date().toLocaleString() + ': ' + item.modelNumber + ' mean price is updated to $' + newMeanPrice +
        ', and set availability to true\n');
    })
    // console.log(val)})
    .catch(err => {
      console.log(new Date().toLocaleString() + ': ' + err + ' error updating item price.');
    });
}

ItemSchema.statics.updateAvailability = function (item) {
  this.updateOne(
    { 'modelNumber': item.modelNumber },
    {
      $set: {
        'availability': false,
      }
    })
    .then(val => {
      console.log(new Date().toLocaleString() + ': ' + item.modelNumber + ' Availability updated to false')
    })
    // console.log(val)})
    .catch(err => {
      console.log(new Date().toLocaleString() + ': ' + err + ' error updating item availiability.');
    });
}

ItemSchema.statics.resetDbPrice = function () {
  this.updateMany({},
    {
      $set: {
        'meanPrice': 0,
        'meanCount': 0,
        'vendors.$.currentPrice': 0
      }
    })
    .then(val => {
      console.log(new Date().toLocaleString() + ': ' + item.modelNumber + ' mean price is updated to $' + newMeanPrice)
    })
    // console.log(val)})
    .catch(err => {
      console.log(new Date().toLocaleString() + ': ' + err + ' error updating item price.');
    });
  return;
}

/*
 * Note: Mongoose automatically looks for the plural, lowercased version of your model name.
 * i.e) Item -> items collection
 */
const Item = mongoose.model("Item", ItemSchema);

module.exports = Item;
