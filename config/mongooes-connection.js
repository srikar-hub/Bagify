const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://koppunoorisrikar:MuMMy1234@cluster0.m8wobte.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(function () {
    console.log("Connected to mongoDB");
  })
  .catch(function (err) {
    console.log(err);
  });

module.exports = mongoose.connection;
