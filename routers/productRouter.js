const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const upload = require("../config/multer-config");
router.get("/", function (req, res) {
  res.send("Working");
});

router.post("/create", upload.single("image"), async function (req, res) {
  try {
    let { price, name, discount, bgcolor, panelcolor, textcolor } = req.body;
    let product = await productModel.create({
      image: req.file.buffer,
      price,
      name,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });
    req.flash("success", "Product has been Created");
    res.redirect("/owners/admin");
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
