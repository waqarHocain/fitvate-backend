const router = require("express").Router();

const {
  googleAuth,
  facebookAuth,
  signup,
  login,
  newAccessToken,
} = require("../controllers/auth.controller");
const { sendOtp, checkOtp } = require("../controllers/mobileAuth.controller");

// email
router.post("/signup", signup);
router.post("/login", login);

// google
router.post("/google", googleAuth);

// facebook
router.post("/facebook", facebookAuth);

// refresh token
router.post("/refresh", newAccessToken);

// mobile
router.post("/mobile/send-otp", sendOtp);
router.post("/mobile/check-otp", checkOtp);

module.exports = router;
