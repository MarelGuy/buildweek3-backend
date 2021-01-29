const express = require("express");
const app = express.Router();
const { validateExperience } = require("../../validator");
const { uploadCloudinary } = require("../../utils/cloudinary");
const ExperienceSchema = require("../../model/experiences");
const ProfileSchema = require("../../model/profiles");
const { APIError } = require("../../utils");
const { validationResult } = require("express-validator");
/// First one is done
app.get("/:userName", async (req, res, next) => {
  try {
    const profile = await ProfileSchema.findOne({
      username: req.params.userName,
    });
    const experince = await ExperienceSchema.find({
      username: profile._id,
    }).populate("username");
    console.log(req.params.userName);

    res.send(experince);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.post("/:username/experiences/CSV", async (req, res, next) => {
  try {
    const profile = await ProfileSchema.findOne({
      username: req.params.username,
    });
    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=data.csv",
    });
    Experience_Schema.find({
      username: profile._id,
    })
      .populate("username")
      .sort({ _id: 1 })
      .limit(100)
      .csv(res);
  } catch (error) {
    next(error);
  }
});
app.post("/:username", validateExperience, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(errors.array(), 404);
    const profile = await ProfileSchema.findOne({
      username: req.params.username,
    });
    console.log(profile, "asdasd");

    if (profile) {
      const newExperience = { ...req.body, username: profile._id };
      console.log(newExperience);

      const myExp = new ExperienceSchema(newExperience);
      await myExp.save();
      res.status(201).send(myExp);
    } else {
      res.send("Error");
    }
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.post(
  "/:userName/experiences/:expId/upload",
  uploadCloudinary.single("image"),
  async (req, res, next) => {
    try {
      const addPicture = await ExperienceSchema.findByIdAndUpdate(
        req.params.expId,
        {
          $set: {
            image: req.file.path,
          },
        }
      );
      if (addPicture) {
        res.status(200).send(addPicture);
      } else {
        const err = new Error();
        err.message = `Profile Id: ${req.params.id} not found`;
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
/// second one is done
app.get("/:userName/experiences/:expId", async (req, res, next) => {
  try {
    // await ProfileSchema.findOne({
    //   username: req.params.userName,
    // });
    const experince = await ExperienceSchema.findById(req.params.expId);
    console.log(experince);
    res.send(experince);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});
/// put is done
app.put("/:userName/experiences/:expId", async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(errors.array(), 404);
    const modified = await ExperienceSchema.findByIdAndUpdate(
      req.params.expId,
      {
        ...req.body,
      }
    );
    console.log(modified);
    if (!isNaN(modified)) throw new APIError("modified fail", 500);
    res.send(modified);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.delete("/:userName/experiences/:expId", async (req, res, next) => {
  try {
    const deleteExperice = await ExperienceSchema.findByIdAndDelete(
      req.params.expId
    );
    console.log(deleteExperice);
    res.send(deleteExperice);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

module.exports = app;
