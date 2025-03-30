const { Router } = require("express");
const authorController = require("../controllers/authorController.js");
const authorRouter = Router();
const passport = require("../middleware/passportConfig");

authorRouter.get("/:authorId/posts", authorController.getPostsByAuthorId);
authorRouter.get("/:authorId/comments", authorController.getCommentsByAuthorId);
authorRouter.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorController.updateProfilePicture
);
module.exports = authorRouter;
