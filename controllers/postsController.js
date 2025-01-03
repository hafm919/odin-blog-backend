const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllPosts = async (req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: { email: true, name: true },
      },
    },
  });
  res.json(posts);
};

exports.getPostById = async (req, res) => {
  const postId = req.params.postId;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });
  res.json(post);
};

exports.createPost = async (req, res) => {
  if (req.user.role != "editor") {
    return res.status(403).send("Unauthorized");
  }
  const authorId = req.user.id;
  await prisma.post.create({
    data: {
      authorId,
      content: req.body.content,
      title: req.body.title,
    },
  });
  res.send("Post Created");
};

exports.addComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const userId = req.user.id;
  try {
    await prisma.comment.create({
      data: { content: req.body.content, postId, userId },
    });
    res.status(200).send("added comment");
  } catch (error) {
    res.status(400);
  }
};

exports.getAllCommentsByPostId = async (req, res, next) => {
  const postId = Number(req.params.postId);

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  res.json(comments);

  next();
};
