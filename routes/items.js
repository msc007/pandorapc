const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

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

module.exports = router;
