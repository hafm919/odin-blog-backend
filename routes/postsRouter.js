const { Router } = require("express");
const postController = require("../controllers/postsController");
const postsRouter = Router();
const passport = require("../middleware/passportConfig");

postsRouter.get("/", postController.getAllPosts);
postsRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);
postsRouter.post(
  "/:postId/comments/",
  passport.authenticate("jwt", { session: false }),
  postController.addComment
);
postsRouter.get("/:postId/comments/", postController.getAllCommentsByPostId);
postsRouter.get("/:postId", postController.getPostById);

module.exports = postsRouter;
