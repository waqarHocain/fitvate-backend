const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const db = require("../services/db");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async (req, res) => {
  const mobileNumber = req.body.mobileNumber;

  if (!mobileNumber)
    return res.status(400).json({
      error: "Mobile number missing.",
    });

  try {
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });
    console.log(`Verification SID: ${verification.sid}`);
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    console.error("Couldn't send OTP: ", e);
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

const checkOtp = async (req, res) => {
  const mobileNumber = req.body.mobileNumber;
  const otp = req.body.otp;

  if (!mobileNumber || !otp)
    return res.status(400).json({
      error: "Mobile number or otp code missing.",
    });

  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({
        to: mobileNumber,
        code: otp,
      });

    if (verificationCheck.status === "approved") {
      try {
        const user = await db.user.findUnique({
          where: {
            mobileNumber,
          },
        });
        let tokenId = user.id;
        if (!user) {
          const newUser = await db.user.create({
            data: {
              mobileNumber,
            },
          });
          tokenId = newUser.id;
        }
        const token = jwt.sign(
          {
            expiresIn: "12h",
            id: tokenId,
          },
          process.env.JWT_SECRET
        );
        return res.json({
          success: true,
          message: "OTP verified successfully",
          token,
        });
      } catch (e) {
        console.error(e);
        return res.status(500).json({
          error: "Unable to create account",
        });
      }
    }
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  } catch (e) {
    console.error("Error verifying OTP:", e);
    res.status(500).json({ success: false, error: "Failed to verify OTP" });
  }
};

module.exports = {
  sendOtp,
  checkOtp,
};
