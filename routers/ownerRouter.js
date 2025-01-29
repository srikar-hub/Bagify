const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.send("Owners");
});

router.get("/admin", function (req, res) {
  let success = req.flash("success");
  res.render("createproducts", { success });
});


module.exports = router;
