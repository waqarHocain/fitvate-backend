const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const db = require("../services/db");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
    session: false,
  }),
  async (req, res) => {
    const token = jwt.sign(
      {
        expiresIn: "12h",
        id: req.user.id,
        email: req.user.email,
      },
      process.env.JWT_SECRET
    );

    console.log(token, "token");

    res.json({
      token,
    });
  }
);

module.exports = router;
