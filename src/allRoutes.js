const router = require("express").Router();

router.use("/profiles", require("./services/profiles"));
router.use("/posts", require("./services/posts"));
router.use("/experiences", require("./services/experiences"));
router.use("/comments", require("./services/comments"));

module.exports = router;
