const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const ProfileSchema = new Schema(
    {
        name: String,
        surname: String,
        email: String,
        bio: String,
        title: String,
        area: String,
        image: String,
        username: String
    },
    {
        timestamps: true,
    }
)

Profile_Schema = mongoose.model("profiles", ProfileSchema)

module.exports = (Profile_Schema) 