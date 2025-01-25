const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const passport = require("./middleware/passportConfig");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET", "PUT"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const postsRouter = require("./routes/postsRouter");
const authRouter = require("./routes/authRouter");
const authorRouter = require("./routes/authorRouter");

app.use("/posts", postsRouter);
app.use("/auth", authRouter);
app.use("/author", authorRouter);

app.listen(3000);
