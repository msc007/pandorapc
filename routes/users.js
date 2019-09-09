const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureNotAuthenticated, ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');
const Item = require('../models/Item');

/* GET LOGIN ROUTE  */
router.get('/login', ensureNotAuthenticated, (req, res) => {
  res.render('login');
});

/* POST LOGIN ROUTE  */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

/* GET LOGOUT ROUTE  */
router.get('/logout', ensureAuthenticated, (req, res) => {
  req.logout();
  req.flash('success_msg', 'Logged out successfully');
  res.redirect('/users/login');
});

/* GET SIGNUP ROUTE  */
router.get('/signup', ensureNotAuthenticated, (req, res) => {
  res.render('signup');
});

/* POST SIGNUP ROUTE  */
router.post('/signup', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  //Check required field
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  } else {
    //Check password match
    if (password !== password2)
      errors.push({ msg: 'Passwords do not match' });

    if (password.length < 6)
      errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('signup', {
      errors,
      name,
      email,
      password,
      password2
    })
  } else {
    // If Validation passed
    User.findOne({ email: email })
      .then(user => {
        if (user) {
          //User already exists
          errors.push({ msg: "Email is already registered" });
          res.render('signup', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          //User not exists
          const newUser = new User({
            name,
            email,
            password,
          });

          //Hash password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              //Hashed password
              newUser.password = hash;
              //Save user
              newUser.save()
                .then(user => {
                  req.flash('success_msg', 'Successfully registered!')
                  res.redirect('/users/login');
                })
                .catch(err => {
                  console.log(err);
                });
            })
          });
        }
      })
  }
});

/* GET DASHBOARD ROUTE  */
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  // Find all the items cureent user subscribed.
  Item.find({ subscribers: req.user.email })
    .then(items => {
      res.render('dashboard', {
        items: items,
        name: req.user.name,
        email: req.user.email,
        sessionID: req.sessionID
      });
    })
    .catch(err => {
      throw err;
    })
});

module.exports = router;
