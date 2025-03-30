const { Router } = require("express");
const postController = require("../controllers/postsController");
const postsRouter = Router();
const passport = require("../middleware/passportConfig");

postsRouter.get("/", postController.getAllPublishedPosts);
postsRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);
postsRouter.put(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  postController.updatePost
);
postsRouter.patch(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  postController.togglePublishedMode
);
postsRouter.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  postController.deletePost
);
postsRouter.delete(
  "/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  postController.deleteComment
);
postsRouter.post(
  "/:postId/comments/",
  passport.authenticate("jwt", { session: false }),
  postController.addComment
);

postsRouter.get("/:postId/comments/", postController.getAllCommentsByPostId);
postsRouter.get("/:postId", postController.getPostById);

module.exports = postsRouter;
