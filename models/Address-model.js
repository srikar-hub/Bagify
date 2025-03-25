const mongoose = require("mongoose");
const AddressSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  fullName: String,
  mobile: String,
  pincode: String,
  address: String,
  city: String,
  state: String,
});

module.exports = mongoose.model("address", AddressSchema);
