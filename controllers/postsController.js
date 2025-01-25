const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp + file extension
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid =
      allowedTypes.test(file.mimetype) &&
      allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) cb(null, true);
    else cb(new Error("Only image files are allowed!"));
  },
});

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

exports.createPost = [
  upload.single("image"),
  async (req, res) => {
    if (req.user.role != "editor") {
      return res.status(403).send("Unauthorized");
    }
    const authorId = req.user.id;
    const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : null;
    await prisma.post.create({
      data: {
        authorId,
        content: req.body.content,
        title: req.body.title,
        imageUrl: imagePath,
      },
    });
    res.status(200).send("Post Created");
  },
];

exports.updatePost = [
  upload.single("image"),
  async (req, res) => {
    if (req.user.role != "editor") {
      return res.status(403).send("Unauthorized");
    }
    const { postId } = req.params;
    const { content, title } = req.body;
    const authorId = req.user.id;
    const imagePath = req.file ? `/uploads/posts/${req.file.filename}` : null;

    await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        authorId,
        content,
        title,
        imageUrl: imagePath || undefined,
      },
    });
    res.status(200).send("Post Updated");
  },
];

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
