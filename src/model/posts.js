const { Schema, model } = require("mongoose");
const q2m = require("query-to-mongo");
const { APIError } = require("../utils");

const PostsSchema = new Schema(
  {
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "profiles", required: true },
    image: { type: String, default: "https://picsum.photos/400" },
    comments: [{ type: Schema.Types.ObjectId, ref: "comments" }],
    likes: [
      {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        surname: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

PostsSchema.static("getAllPosts", async function (req) {
  try {
    const query = q2m(req.query);
    const total = await this.countDocuments(query.criteria);
    const posts = await this.find(query.criteria, query.optionsfields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)
      .populate([
        { path: "comments", populate: { path: "user" } },
        { path: "user" },
      ]);
    const payload = {
      links: query.links(`/posts`, total),
      posts,
    };
    return payload;
  } catch (error) {
    console.log(error);
    return error;
    throw new APIError(error);
  }
});

PostsSchema.static("updatePostByPostId", async function (postId, body) {
  try {
    const updatePost = await this.findByIdAndUpdate(
      postId,
      {
        $set: {
          text: body.text,
          image: body.image ? body.image : "https://picsum.photos/400",
        },
      },
      { runValidators: true, new: true }
    );
    const { _id } = await updatePost.save();
    return _id;
  } catch (error) {
    throw new APIError(error);
  }
});

const PostsModel = model("posts", PostsSchema);
module.exports = PostsModel;
