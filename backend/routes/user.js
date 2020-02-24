const express = require("express");
const bcryptjs = require("bcryptjs");

const User = require("../models/user")

const router = express.Router();

router.post("/signup", (req, res, next) => {
    bcryptjs.hash(req.body.password, 10).then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user
        .save()
        .then(result => {
          res.status(201).json({
            message: "User created!",
            result: result
          });
        })
        .catch(err => {
          res.status(500).json({
            error: err
          });
        });
    });
});

module.exports = router;