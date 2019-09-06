const express = require('express');
const router = express.Router();
const Item = require('../models/Item');


// Index Route
router.get('/', (req, res) => {
    Item.find({})
        .then(items => {
            res.render('main', {
                items: items
            });
        })
        .catch(err => {
            throw err;
        });
});

module.exports = router;