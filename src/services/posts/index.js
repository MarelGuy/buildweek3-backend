const express = require("express");
const PostsRouter = express.Router();
const { validatePost } = require("../../validator");
const { validationResult } = require("express-validator");
const PostsModel = require("../../model/posts");
const { APIError } = require("../../utils");
const {
  uploadCloudinary,
  uploadCloudinaryWithLimit,
} = require("../../utils/cloudinary");
PostsRouter.route("/")
  .get(async (req, res, next) => {
    try {
      const payload = await PostsModel.getAllPosts(req);
      res.send(payload);
    } catch (error) {
      next(error);
    }
  })
  .post(validatePost, async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw APIError(errors.array(), 404);
      const payload = {
        ...req.body,
        image: req.body.image ? req.body.image : "https://picsum.photos/x400",
      };
      const newPost = await PostsModel(payload);
      const { _id } = await newPost.save();
      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  });

PostsRouter.route("/:postId")
  .get(async (req, res, next) => {
    try {
      const payload = await PostsModel.findById(req.params.psotId);
      res.send(payload);
    } catch (error) {
      next(error);
    }
  })
  .put(validatePost, async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw APIError(errors.array(), 404);
      const _id = await PostsModel.updatePostByPostId(
        req.params.postId,
        req.body
      );
      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const payload = await PostsModel.findByIdAndDelete(req.params.postId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  })
  .post(uploadCloudinary.single("image"), async (req, res, next) => {
    let imageUrl;
    if (req.file && req.file.path) imageUrl = req.file.path;
    try {
      const { _doc } = await PostsModel.findById(req.params.postId);
      const payload = { ..._doc, image: imageUrl };
      const _id = await PostsModel.updatePostByPostId(
        req.params.postId,
        payload
      );
      res.status(201).send(_id);
    } catch (error) {
      next(error);
    }
  });

module.exports = PostsRouter;
