const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile");
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

exports.getPostsByAuthorId = async (req, res) => {
  const authorId = req.params.authorId;
  const posts = await prisma.post.findMany({
    where: { authorId: parseInt(authorId) },
  });
  res.json(posts);
};

exports.getCommentsByAuthorId = async (req, res) => {
  const authorId = req.params.authorId;
  const posts = await prisma.comment.findMany({
    where: { userId: parseInt(authorId) },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
  res.json(posts);
};

exports.updateProfilePicture = [
  upload.single("profileImg"),
  async (req, res) => {
    console.log("Request received");

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const id = req.user.id;
      const imageUrl = `/uploads/profile/${req.file.filename}`;

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { profileImg: imageUrl },
      });

      console.log("Profile picture updated successfully");

      return res.status(200).json({
        message: "Profile picture updated",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);

      if (!res.headersSent) {
        // Prevent multiple responses
        return res.status(500).json({
          error: "Error updating profile picture",
          details: error.message,
        });
      }
    }
  },
];
