const { Router } = require("express");
const authorController = require("../controllers/authorController.js");
const authorRouter = Router();

authorRouter.get("/:authorId/posts", authorController.getPostsByAuthorId);
authorRouter.get("/:authorId/comments", authorController.getCommentsByAuthorId);
module.exports = authorRouter;
