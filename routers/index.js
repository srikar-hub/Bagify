const express = require("express");
const router = express.Router();
const isloggedIn = require("../middlewares/isloggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedIn: false });
});
router.get("/shop", isloggedIn, async function (req, res) {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success });
});
router.post("/addtocart/:productId", isloggedIn, async (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body; // Get the quantity from the form submission

  try {
    const user = await userModel.findOne({ email: req.user.email });

    // Check if the product is already in the cart
    const existingProduct = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingProduct) {
      // If the product is already in the cart, update the quantity
      // parseInt means we are changing the input which is coming from from to number means it is base 10 digit like that
      existingProduct.quantity += parseInt(quantity, 10);
    } else {
      // Otherwise, add the product to the cart with the specified quantity
      user.cart.push({ productId, quantity: parseInt(quantity, 10) });
    }

    await user.save();
    req.flash("success", "Product added to cart successfully");
    res.redirect("/shop");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add product to cart");
    res.redirect("/shop");
  }
});

router.get("/cart", isloggedIn, async (req, res) => {
  const success = req.flash("success");
  const error = req.flash("error");

  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: "cart.productId",
    });
    res.render("cart", { user, success, error });
  } catch (err) {
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
});

router.get("/cart/remove/:productid", isloggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    let updatedCart = user.cart.filter(function (item) {
      return item.productId.toString() !== req.params.productid;
    });
    let product = await userModel.updateOne(
      { email: req.user.email },
      { $set: { cart: updatedCart } }
    );
    req.flash("success", "Item removed from the Cart");
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong");
    res.redirect("/cart");
  }
});

router.get("/cart/decrese/:productId", isloggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let product = user.cart.find(function (item) {
      return item.productId.toString() === req.params.productId;
    });
    if (product) {
      if (product.quantity > 1) {
        product.quantity -= 1;
      }
    } else {
      user.cart = user.cart.filter(function (item) {
        return item.productId.toString() !== req.params.productId;
      });
    }
    await user.save();
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    res.redirect("/cart");
  }
});

router.get("/cart/increase/:productid", isloggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let product = user.cart.find(function (item) {
      return item.productId.toString() === req.params.productid;
    });

    if (product) {
      product.quantity += 1;
    }
    await user.save();
    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    res.redirect("/cart");
  }
});
module.exports = router;
