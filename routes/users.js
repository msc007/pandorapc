const express = require('express');
const router = express.Router();

// auth login
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    //handle with passport
    res.send('logging out');
});

router.get('/signup', (req, res) => {
    res.render('signup');
})

module.exports = router;
