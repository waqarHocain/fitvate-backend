require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const passport = require("passport");

// local imports
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/user");
const { requireAuth } = require("./middlewares/requireAuth");

const app = express();

// logger
app.use(morgan("tiny"));

// Bodyparser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// public route handlers
app.use("/auth", authRouter);

// protected route handlers
app.use("/users", requireAuth, userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
