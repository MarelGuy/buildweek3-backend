const express = require("express");
const app = express.Router();
const multer = require("multer");
const {validateExperience} = require("../../validator")
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { uploadCloudinary } = require("../../utils/cloudinary");
const ExperienceSchema = require("../../model/experiences");
const ProfileSchema = require("../../model/profiles");
const { validationResult } = require("express-validator");
const requestIp = require("request-ip");
const path = require("path");
const {APIERROR} = require("../../utils")
const { createReadStream, createWriteStream } = require("fs-extra");

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

/// waaait  i will do it
// app.get('/:userName/exp/csv', async (req, res, next) => {
//     try {
//         const profile = await ProfileSchema.findOne({username:req.params.userName})
//         const experince = await ExperienceSchema.find({username:profile._id}).populate("username")

//         const jsonReadableStream = createReadStream(experince)
//         const json2csv = new Transform({
//             fields:["role","company","description"],
//         })
//        res.setHeader("Content-Disposition","attachment; filename=export.csv")
//        pipeline(jsonReadableStream,json2csv,res,err=>{
//         if (err) {
//             console.log(err)
//             next(err)
//           } else {
//             console.log("Done")
//           }
//        })
//     } catch (err) {
//         console.log("\x1b[31m", err)
//         next(err)
//     }
// });
/// post is done

app.get("/:username/exp/csv", async (req, res, next) => {
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
app.post("/:username/exp",validateExperience, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if(!errors.isEmpty()) throw APIERROR(errors.array(),404)
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
  "/:userName/exp/:expId/upload",
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
app.get("/:userName/exp/:expId", async (req, res, next) => {
  try {
    const profile = await ProfileSchema.findOne({
      username: req.params.userName,
    });
    const experince = await ExperienceSchema.findById(req.params.expId);
    console.log(experince);
    res.send(experince);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});
/// put is done
app.put("/:userName/exp/:expId", async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) throw APIError(errors.array(), 404);
    const modifed = await ExperienceSchema.findByIdAndUpdate(req.params.expId, {
      ...req.body,
    });
    console.log(modifed);
    res.send(modifed);
  } catch (err) {
    console.log("\x1b[31m", err);
    next(err);
  }
});

app.delete("/:userName/exp/:expId", async (req, res, next) => {
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
