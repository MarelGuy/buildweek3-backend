const { Schema } = require("mongoose")
const mongoose = require("mongoose")

const CommentSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "profiles", required: true },
        content: String
    },
    {
        timestamps: true,
    }
)

Comment_Schema = mongoose.model("comments", CommentSchema)

module.exports = (Comment_Schema) 