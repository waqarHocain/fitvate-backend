require("dotenv").config();

const express = require("express");
const passport = require("passport");

// local imports
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/user");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
require("./services/googleStrategy");
require("./services/jwtStrategy");
require("./services/facebookStrategy");

// public route handlers
app.use("/auth", authRouter);

// protected route handlers
app.use("/users", passport.authenticate("jwt", { session: false }), userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
