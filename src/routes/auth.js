const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { googleAuth } = require("../controllers/auth.controller");
const { sendOtp, checkOtp } = require("../controllers/mobileAuth.controller");

// google
router.post("/google", googleAuth);

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
      },
      process.env.JWT_SECRET
    );

    res.json({
      token,
    });
  }
);

// mobile
router.post("/mobile/send-otp", sendOtp);
router.post("/mobile/check-otp", checkOtp);

module.exports = router;
