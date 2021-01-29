//const passportLocalMongoose = require('passport-local-mongoose');
const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const md5 = require("md5");
const ProfileSchema = new Schema(
  {
    name: String,
    surname: String,
    email: { type: String, unique: true },
    bio: String,
    title: { type: String, default: "New User" },
    area: String,
    image: { type: String, default: "https://picsum.photos/100" },
    username: { type: String, unique: true },
    password: String,
  },
  {
    timestamps: true,
  }
);

//ProfileSchema.plugin(passportLocalMongoose)

ProfileSchema.pre("save", function (next) {
  this.password = md5(this.password);
  next();
});

Profile_Schema = mongoose.model("profiles", ProfileSchema);

module.exports = Profile_Schema;
