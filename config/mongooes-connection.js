const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/snatch")
  .then(function () {
    console.log("Connected to mongoDB");
  })
  .catch(function (err) {
    console.log(err);
  });

module.exports = mongoose.connection;
