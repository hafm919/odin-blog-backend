const { PrismaClient } = require("@prisma/client");
const { body, validationResult } = require("express-validator");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const passport = require("../middleware/passportConfig");
const jwt = require("jsonwebtoken");

const validateUser = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email not valid")
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        throw new Error("Email already in use");
      }
    })
    .withMessage("Email already in use"),
  body("password")
    .custom((password, { req }) => {
      return password === req.body.repeat_password;
    })
    .withMessage("Passwords don't match"),
  body("name").trim().isAlpha().withMessage("Name should only contain letters"),
];

exports.signUpUser = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        name: req.body.name,
        role: "subscriber",
      },
    });
    res.status(200).send("User Created Succesfully");
    next();
  },
];

exports.loginUser = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user,
        info,
      });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign(
        { id: user.id },
        process.env.AUTHENTICATION_SECRET
      );
      return res.json({ user, token });
    });
  })(req, res, next);
};
