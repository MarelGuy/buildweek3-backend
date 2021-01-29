const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Profile = require("./model/profiles");
const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const app = express();
const servicesRoutes = require("./allRoutes");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
  badRequestHandler,
} = require("./errorHandler");
const port = process.env.PORT || 3001;
const { getClientIp } = require("request-ip");

const whiteList =
  process.env.NODE_ENV === "production"
    ? [process.env.FE_URL_PROD]
    : [process.env.FE_URL_DEV];
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("NOT ALLOWED - CORS ISSUES"));
    }
  },
};

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Logged ${"\x1b[34m"} ${getClientIp(req)} ${"\x1b[32m"}${req.url} ${
      req.method
    } ${"\x1B[0m"}${new Date()}`
  );
  next();
};

app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Endpoints

app.use("/", servicesRoutes);

app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(badRequestHandler);
app.use(catchAllHandler);

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    app.listen(port, () => {
      console.log("\x1b[34m", "Running on port", port, "\x1b[37m");
    })
  )
  .catch((err) => console.log(err));
