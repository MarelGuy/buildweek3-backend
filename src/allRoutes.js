const router = require("express").Router();
const PostsRouter = require("./services/posts");

router.use("/posts", PostsRouter);

module.exports = router;
