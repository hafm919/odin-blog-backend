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
  body("fullName")
    .trim()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should only contain letters and spaces"),
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
        name: req.body.fullName,
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
      return res
        .status(400)
        .json({ message: info ? info.message : "Invalid credentials" });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }
      const token = jwt.sign(user, process.env.AUTHENTICATION_SECRET);
      return res.json({ user, token });
    });
  })(req, res, next);
};
