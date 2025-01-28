const express = require("express");
const path = require("path");
const app = express();
const cookieParser = require("cookie-parser");
const dp = require("./config/mongooes-connection");
const ownerRouter = require("./routers/ownerRouter");
const userRouter = require("./routers/userRouter");
const indexRouter = require("./routers/index");
const productRouter = require("./routers/productRouter");
const expressSession = require("express-session");
const flash = require("connect-flash");

app.set("view engine", "ejs");

app.use(
  expressSession({
    secret: "thisIsMyVerySecureAndRandomSecretKey123!@#",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/owners", ownerRouter);
app.use("/users", userRouter);
app.use("/products", productRouter);

app.listen("4000");
