const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const ExperienceSchema = new Schema(
  {
    role: String,
    company: String,
    startDate: String,
    description: String,
    area: String,

    image: String,
    username: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profiles",
    },
  },
  {
    timestamps: true,
  }
);
ExperienceSchema.static("addUser", async function (user) {
  console.log("is this my user", user);

  await ExperienceSchema.findOneAndUpdate(
    { _id: id },
    {
      $addToSet: { username: { user } },
    }
  );
});

Experience_Schema = mongoose.model("experiences", ExperienceSchema);

module.exports = Experience_Schema;
