const router = require("express").Router();

const { googleAuth, facebookAuth } = require("../controllers/auth.controller");
const { sendOtp, checkOtp } = require("../controllers/mobileAuth.controller");

// google
router.post("/google", googleAuth);

// facebook
router.post("/facebook", facebookAuth);

// mobile
router.post("/mobile/send-otp", sendOtp);
router.post("/mobile/check-otp", checkOtp);

module.exports = router;
