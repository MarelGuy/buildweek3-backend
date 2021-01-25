const router = require("express").Router();
const PostsRouter = require("./services/posts");
const experiencesRoute = require("./services/experiences");
const profilesRoute = require("./services/profiles");
router.use("/posts", PostsRouter);
router.use("/profiles", profilesRoute);
router.use("/experiences", experiencesRoute);
module.exports = router;
