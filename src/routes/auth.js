const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const db = require("../services/db");

// google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/",
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

    res.json({
      token,
    });
  }
);

// facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    failureRedirect: "/",
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

    res.json({
      token,
    });
  }
);

module.exports = router;
