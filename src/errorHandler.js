const catchAll = (err, req, res, next) => {
  if (!res.headersSent) {
    res.status(err.httpStatusCode || 500).send("Error 500, Server err");
  }
  console.log(err.message);
};

const unauthorized = (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    res.status(401).send("Error 401, Unauthorized");
  }
  next(err);
};
const badRequestHandler = (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    res.status(400).send(err);
  }
  //we need to put next so that if it doesn't match the if criteria goes to the next handler
  next(err);
};
const forbidden = (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    res.status(403).send("Error 403, Forbidden");
  }
  next(err);
};

const notFound = (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    res.status(404).send("Error 404, Not Found");
  }
  next(err);
};

module.exports = {
  catchAll,
  unauthorized,
  forbidden,
  notFound,
  badRequestHandler,
};
