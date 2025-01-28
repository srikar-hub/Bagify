const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
  },
  email: String,
  password: String,
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  orders: {
    type: Array,
    default: [],
  },
  contact: Number,
  picture: String,
});

module.exports = mongoose.model("user", userSchema);
