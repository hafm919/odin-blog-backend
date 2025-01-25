const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
          title: true,
        },
      },
    },
  });
  res.json(posts);
};
