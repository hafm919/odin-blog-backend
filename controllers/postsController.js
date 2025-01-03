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
  console.log(req.user);
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
  console.log(postId);
  try {
    await prisma.comment.create({
      data: { content: req.body.content, postId, userId },
    });
    console.log("done");
    res.status(200).send("added comment");
  } catch (error) {
    res.status(400);
  }
};

exports.getAllCommentsByPostId = async (req, res, next) => {
  const postId = Number(req.params.postId);
  console.log(postId);

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
  console.log(comments);
  res.json(comments);

  next();
};
