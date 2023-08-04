const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const hbs = require("express-handlebars");
const multer = require("multer");
const adminRouter = require("./routes/admin");
const usersRouter = require("./routes/users");
const bodyParser = require("body-parser");
const handlebars_helpers = require("handlebars-helpers");
const config = require("./config/config");

const app = express();

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://priyareji:i7Pk6cN54h95ITlk@cluster0.uhtfoms.mongodb.net/"
);
// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
    helpers: handlebars_helpers(),
  })
);

app.use(logger("dev"));
app.use(express.json());

app.use(cookieParser());
app.use(session({ secret: config.sessionSecret }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/admin", adminRouter);
app.use("/", usersRouter);

const Storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploads = multer({ storage: Storage });
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
app.listen(3000, function () {
  console.log("server is running...");
});

module.exports = app;
