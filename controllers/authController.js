const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;

    let Users = await userModel.findOne({ email });
    if (!Users) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          let user = await userModel.create({
            fullname,
            email,
            password: hash,
          });
          let token = jwt.sign({ email, userid: user._id }, "shshshsh");
          res.cookie("token", token);
          res.status(200).send(user);
        });
      });
    } else {
      res.status(500).send("Email already exists try another Email");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "Something went Wrong");
      res.redirect("/");
    } else {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
          let token = jwt.sign({ email, userid: user._id }, "shshshsh");
          res.cookie("token", token);
          res.redirect("/shop");
        } else {
          req.flash("error", "Email or Password is Wrong.");
          res.redirect("/");
        }
      });
    }
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/");
  }
};

module.exports.logout = async function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
};


