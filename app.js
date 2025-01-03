const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const passport = require("./middleware/passportConfig");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const postsRouter = require("./routes/postsRouter");
const authRouter = require("./routes/authRouter");

app.use("/posts", postsRouter);
app.use("/auth", authRouter);

app.listen(3000);
