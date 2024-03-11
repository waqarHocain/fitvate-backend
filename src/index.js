require("dotenv").config();

const express = require("express");
const passport = require("passport");

// local imports
const authRouter = require("./routes/auth.js");

const app = express();

// Bodyparser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
require("./services/googleStrategy");
require("./services/jwtStrategy");

// route handlers
app.use("/auth", authRouter);

// serialize / deserialize user
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
  cb(null, { id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
