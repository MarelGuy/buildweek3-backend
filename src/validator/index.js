const { body } = require("express-validator");

const validateExperience = [
  body("role", "tell your role").isString(),
  body("company", "tell your role").isString(),
  body("description", "tell your role").isString(),
];
const validateProfile = [
  body("name", "invalid name").isString(),
  body("surname", "invalid surname").isString(),
  body("email", "invalid email").isString(),
  body("bio", "say something about you!").isString(),
  body("title", "invalid title").isString(),
  body("area", "invalid area").isString(),
  body("username", "invalid username").isString()
];

const validatePost = [
  body("text", "share something with us!").isString(),
  body("username", "Invalid username").isAlphanumeric(),
];

const validateComment = [
  body("user", "invalid user").exists(),
  body("content", "invalid content").isString(),
]


module.exports = { validatePost, validateExperience, validateProfile, validateComment };