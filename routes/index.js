const express = require('express');
const router = express.Router();
const Item = require('../models/Item');


// Index Route
router.get('/', (req, res) => {
    Item.find({})
        .then(items => {
            if (req.isAuthenticated()) {
                //authenticated user
                res.render('main', {
                    items: items,
                    name: req.user.name,
                    sessionID: req.sessionID
                });
            } else {
                //not authenticated user
                res.render('main', {
                    items: items,
                    name: undefined,
                    sessionID: undefined
                });
            }
        })
        .catch(err => {
            throw err;
        });
});

module.exports = router;