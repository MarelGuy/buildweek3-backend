const express = require("express");
const app = express.Router();
const { uploadCloudinary } = require("../../utils/cloudinary");
const PDFDocument = require("pdfkit");
const { validateProfile } = require("../../validator");
const jwt = require("express-jwt");
const auth = require("../middleware/auth");
const mailgun = require("mailgun-js");
const DOMAIN = process.env.MG_DOMAIN;
const mg = mailgun({
  apiKey: process.env.MG_APIKEY,
  domain: process.env.MG_DOMAIN,
});
const senderEmail = "Mailgun Sandbox" + process.env.MG_EMAIL;

const ProfileSchema = require("../../model/profiles");

app.get("/rng", async (req, res, next) => {
  try {
    const profile = await ProfileSchema.find();
    const profileNum = Math.floor(Math.random() * profile.length);
    res.send(profile[profileNum]);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.get("/me", auth.checkToken, (req, res) => {
  res.send(req.user);
});
app.post("/login", auth.login, auth.generateToken);

app
  .route("/")
  .post(async (req, res, next) => {
    try {
      const username = await ProfileSchema.findOne({ username: req.body.username });
      const email = await ProfileSchema.findOne({ email: req.body.email });

      if (username) {
        res.send("User already exists!")
        next()
      } else if (email) {
        res.send("Email already exists!")
        next()
      } else {
        const profile = await new ProfileSchema(req.body).save();
        req.user = profile;
        next();
      }
    } catch (err) {
      next(err);
    }
  }, auth.generateToken)

  .get(async (req, res, next) => {
    try {
      const regex = new RegExp(req.query.name, "ig");
      const profiles = await ProfileSchema.find({
        $or: [{ name: regex }, { surname: regex }],
      });

      if (profiles.length > 0) {
        res.status(200).send(profiles);
      } else {
        res
          .status(404)
          .send(
            "404, not found. Could it be that there aren't any profiles in the databse?"
          );
      }
    } catch (err) {
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
    next(err);
  }
});

app.post(
  "/:id/img_upld",
  uploadCloudinary.single("image"),
  async (req, res, next) => {
    try {
      const addPicture = await ProfileSchema.findByIdAndUpdate(req.params.id, {
        $set: {
          image: req.file.path,
        },
      });
      res.status(200).send(addPicture);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

app
  .route("/:id")
  .get(async (req, res, next) => {
    try {
      const profile = await ProfileSchema.findById(req.params.id);
      if (profile) {
        res.status(200).send(profile);
      } else {
        res
          .status(404)
          .send("404, not found. Wrong id or the elemnt doesn't exist?");
      }
    } catch (err) {
      console.log("\x1b[31m", err);
      next(err);
    }
  })
  .put(validateProfile, async (req, res, next) => {
    try {
      const modifiedProfile = await ProfileSchema.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      if (modifiedProfile) {
        res.status(200).send("profile changed, new id:" + modifiedProfile._id);
      } else {
        res.status(404).send("Unknown error, maybe you mistaken the id?");
        next();
      }
    } catch (err) {
      console.log("\x1b[31m", err);
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const DeletedProfile = await ProfileSchema.findByIdAndDelete(
        req.params.id
      );
      if (DeletedProfile) {
        res.status(200).send("profile deleted!");
      } else {
        res.status(400).send("Unknown error, maybe you mistaken the id?");
        next();
      }
    } catch (err) {
      console.log("\x1b[31m", err);
      next(err);
    }
  });

module.exports = app;
