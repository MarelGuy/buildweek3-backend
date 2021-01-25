const express = require("express");
const app = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { uploadCloudinary } = require("../../utils/cloudinary");
const PDFDocument = require("pdfkit");
const requestIp = require("request-ip");

const ProfileSchema = require("../../model/profiles");

app.get("/", async (req, res, next) => {
  try {
    const profiles = await ProfileSchema.find();
    const clientIp = requestIp.getClientIp(req);

    if (profiles.length > 0) {
      res.status(200).send(profiles);
      console.log("\x1b[32m", clientIp + " did GET/profiles");
    } else {
      res
        .status(404)
        .send(
          "404, not found. Could it be that there aren't any profiles in the databse?"
        );
      console.log(
        "\x1b[33m%s\x1b[0m",
        clientIp + " did GET/profiles but encountered 404"
      );
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.get("/:id", async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const profile = await ProfileSchema.findById(req.params.id).populate(
      "reviews"
    );
    if (profile) {
      res.status(200).send(profile);
      console.log("\x1b[32m", clientIp + " did GET/profiles/" + req.params.id);
    } else {
      res
        .status(404)
        .send("404, not found. Wrong id or the elemnt doesn't exist?");
      console.log(
        "\x1b[33m%s\x1b[0m",
        clientIp + " did GET/profiles/" + req.params.id + " but encountered 404"
      );
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.get("/:id/cv", async (req, res, next) => {
  try {
    const profile = await ProfileSchema.findById(req.params.id);
    const doc = new PDFDocument();

    doc.fontSize(25).text(profile.username);
    doc.text(profile.name);
    doc.text(profile.surname);
    doc.text(profile.title);
    doc.text(profile.area);
    doc.text(profile.email);
    doc.text(profile.bio);
    doc.text(profile.image);

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.post("/", async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const newProfile = new ProfileSchema(req.body);
    var { _id } = await newProfile.save();
    if (_id) {
      res.status(200).send("Created! here's the id of the profile: " + _id);
      console.log("\x1b[32m", clientIp + " created a profile. Id: " + _id);
    } else {
      res.send("Unknown error");
      console.log(
        "\x1b[33m%s\x1b[0m",
        clientIp + " tried to create a profile but encountered an error"
      );
      next();
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.post(
  "/:id/img_upld",
  uploadCloudinary.single("image"),
  async (req, res, next) => {
    try {
      const clientIp = requestIp.getClientIp(req);
      res.status(201).send("Image uploaded on product id:" + req.params.id);
      console.log(
        "\x1b[32m",
        clientIp + " uploaded an image on product id: " + req.params.id
      );
    } catch (err) {
      console.log("\x1b[31m", err);
      next(err);
    }
  }
);

app.put("/:id", async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const modifiedProfile = await ProfileSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    console.log();
    if (modifiedProfile) {
      res.status(200).send("profile changed, new id:" + modifiedProfile._id);
      console.log(
        "\x1b[32m",
        clientIp + " modified a profile, id: " + req.params.id
      );
    } else {
      res.send("Unknown error, maybe you mistaken the id?");
      console.log(
        "\x1b[33m%s\x1b[0m",
        clientIp +
          " tried to modify a profile but encountered an error, id: " +
          req.params.id
      );
      next();
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.delete("/:id", async (req, res, next) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const DeletedProfile = await ProfileSchema.findByIdAndDelete(req.params.id);
    if (DeletedProfile) {
      res.status(200).send("profile deleted!");
      console.log(
        "\x1b[32m",
        clientIp + " deleted a profile, id: " + req.params.id
      );
    } else {
      res.send("Unknown error, maybe you mistaken the id?");
      console.log(
        "\x1b[33m%s\x1b[0m",
        clientIp +
          " tried to delete a profile but encountered an error, id: " +
          req.params.id
      );
      next();
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

module.exports = app;
