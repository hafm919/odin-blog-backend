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

exports.getAllPublishedPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // Default limit to 10
    const posts = await prisma.post.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      where: {
        published: true,
      },
      include: {
        author: {
          select: { email: true, name: true, profileImg: true },
        },
        Category: {
          select: { name: true },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getPostById = async (req, res) => {
  const postId = req.params.postId;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
    include: {
      author: {
        select: { email: true, name: true },
      },
      Category: {
        select: { name: true },
      },
    },
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
    const categoryNames = req.body.categories
      .split(",")
      .map((name) => name.trim().toLowerCase());

    const categoriesData = categoryNames.map((name) => ({
      where: { name },
      create: { name },
    }));

    await prisma.post.create({
      data: {
        authorId,
        content: req.body.content,
        title: req.body.title,
        imageUrl: imagePath,
        Category: {
          connectOrCreate: categoriesData, // Find or create categories (in lowercase)
        },
      },
    });
    res.status(200).send("Post Created");
  },
];

exports.deletePost = async (req, res) => {
  try {
    if (req.user.role !== "editor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { postId } = req.params;

    const deletedPost = await prisma.post.delete({
      where: { id: parseInt(postId) },
    });

    return res
      .status(200)
      .json({ message: "Post deleted successfully", deletedPost });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to delete post", error: error.message });
  }
};

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
    const categoryNames = req.body.categories
      .split(",")
      .map((name) => name.trim().toLowerCase());

    const categoriesData = categoryNames.map((name) => ({
      where: { name },
      create: { name },
    }));

    await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        authorId,
        content,
        title,
        imageUrl: imagePath || undefined,
        Category: {
          connectOrCreate: categoriesData,
        },
      },
    });
    res.status(200).send("Post Updated");
  },
];

exports.togglePublishedMode = async (req, res) => {
  if (req.user.role != "editor") {
    return res.status(403).send("Unauthorized");
  }
  const { postId } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
  });

  await prisma.post.update({
    where: { id: parseInt(postId) },
    data: { published: !post.published },
  });
  res.status(200).send("Post Updated");
};

exports.addComment = async (req, res) => {
  const postId = Number(req.params.postId);
  const userId = req.user.id;

  try {
    const newComment = await prisma.comment.create({
      data: {
        content: req.body.content,
        postId,
        userId,
      },
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(400).json({ error: "Failed to add comment" });
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
          profileImg: true,
        },
      },
    },
  });
  res.json(comments);

  next();
};

exports.deleteComment = async (req, res, next) => {
  const userId = req.user.id;
  const id = parseInt(req.params.commentId);
  await prisma.comment.delete({ where: { id } });
  res.status(200).send("Deleted Succesfully");
};
