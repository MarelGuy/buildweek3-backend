const { body } = require("express-validator");

const validateExperience = [];
const validateProfile = [];

const validatePost = [
  body("text", "share something with us!").isString(),
  body("username", "Invalid username").isAlphanumeric(),
  body("user.id").isAlphanumeric(),
];

module.exports = { validatePost, validateExperience, validateProfile };
