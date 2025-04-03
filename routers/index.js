const express = require("express");

const router = express.Router();
const isloggedIn = require("../middlewares/isloggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const addressModel = require("../models/Address-model");
router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedIn: false });
});
router.get("/shop", isloggedIn, async function (req, res) {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop", { products, success, sortby: "default" });
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

router.get("/shop/sort", async function (req, res) {
  try {
    let products = await productModel.find();
    let sortby = req.query.sortby;
    if (sortby === "lowtohigh") {
      products.sort(function (a, b) {
        const priceAfterDiscountA = a.price - a.discount;
        const priceAfterDiscountB = b.price - b.discount;
        return priceAfterDiscountA - priceAfterDiscountB;
      });
    } else {
      products.sort(function (a, b) {
        const priceAfterDiscountA = a.price - a.discount;
        const priceAfterDiscountB = b.price - b.discount;
        return priceAfterDiscountB - priceAfterDiscountA;
      });
    }

    res.render("shop", { products, sortby, success: "" });
  } catch (err) {
    req.flash("error", "Something went Wrong try again Later");
    res.redirect("/shop");
  }
});

router.get("/buynow", function (req, res) {
  res.render("BuyNow", {
    success: req.flash("success"),
    error: req.flash("error"),
  });
});

router.post("/submit-address", isloggedIn, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/buynow");
    }
    let { fullName, mobile, pincode, address, city, state } = req.body;
    let fulladdress = await addressModel.create({
      user: req.user.id,
      fullName,
      mobile,
      pincode,
      address,
      city,
      state,
    });
    console.log(fulladdress._id);
    user.address.push(fulladdress._id);
    await user.save();
    res.redirect("/delivery");
  } catch (err) {
    req.flash("error", "Something went Wrong try again Later");
    res.redirect("/buynow");
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
router.get("/delivery", isloggedIn, async function (req, res) {
  try {
    let user = await userModel
      .findOne({
        email: req.user.email,
      })
      .populate("address");

    res.render("Delivery", { user });
  } catch (exp) {
    res.send(exp.message);
    req.flash("error", "Something went Wrong");
    res.redirect("/delivery");
  }
});

router.get("/proceed/:addressId", isloggedIn, async function (req, res) {
  const success = req.flash("success");
  const error = req.flash("error");
  try {
    let user = await userModel
      .findOne({
        email: req.user.email,
      })
      .populate("address");
    let addressId = req.params.addressId;
    let selectedAddress = user.address.find(function (address) {
      return address._id.toString() === addressId;
    });
    res.render("info", { selectedAddress, success, error });
  } catch (err) {
    req.flash("error", "Something went Wrong");
    res.redirect("/buynow");
  }
});
router.post("/checkout", isloggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const selectedItems = req.body.selectedItems;

    if (!selectedItems || selectedItems.length === 0) {
      return res.redirect("/cart?error=Please select items to buy.");
    }

    const user = await userModel.findById(userId).populate("cart.productId");

    if (!user) {
      return res.redirect("/cart?error=User not found.");
    }

    // Ensure orders exists
    if (!user.orders) {
      user.orders = [];
    }

    // Filter selected items
    const selectedProducts = user.cart.filter((product) =>
      selectedItems.includes(product.productId._id.toString())
    );

    if (selectedProducts.length === 0) {
      return res.redirect("/cart?error=No valid items selected.");
    }

    // Move selected products to orders
    selectedProducts.forEach((product) => {
      user.orders.push({
        productId: product.productId._id,
        quantity: product.quantity,
      });
    });

    // Remove selected items from cart
    user.cart = user.cart.filter(
      (product) => !selectedItems.includes(product.productId._id.toString())
    );

    // Save user data
    await user.save();

    res.redirect("/delivery?success=Items moved to orders successfully.");
  } catch (error) {
    res.redirect("/cart?error=Something went wrong.");
  }
});

router.get("/myaccount", isloggedIn, async function (req, res) {
  try {
    let user = await userModel
      .findOne({
        email: req.user.email,
      })
      .populate("address");

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render("myAccount", { user });
  } catch (error) {
    console.log("error", error);
  }
});

module.exports = router;
