const { Router } = require("express");
const authController = require("../controllers/authController");
const authRouter = Router();

authRouter.post("/signup", authController.signUpUser);
authRouter.post("/login", authController.loginUser);

module.exports = authRouter;
