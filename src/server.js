const express = require("express");
const cors = require("cors");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
const app = express();
const servicesRoutes = require("./allRoutes");
const {
  catchAll,
  unauthorized,
  forbidden,
  notFound,
  badRequestHandler,
} = require("./errorHandler");

const port = process.env.PORT || 3001;

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

app.use(cors());
app.use(express.json());

// Endpoints

app.use("/", servicesRoutes);
app.use(unauthorized);
app.use(forbidden);
app.use(notFound);
app.use(badRequestHandler);
app.use(catchAll);

// console.log(listEndpoints(app));

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
