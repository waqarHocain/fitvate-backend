const twilio = require("twilio");
const jwt = require("jsonwebtoken");

const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");
const { generateToken } = require("../utils/generateToken");

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOtp = async (req, res) => {
  const mobileNumber = req.body.mobileNumber;
  const requestId = generateReqId();

  if (!mobileNumber)
    return res.status(400).json({
      message: "Mobile number missing.",
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
    });

  try {
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({
        to: mobileNumber,
        channel: "sms",
      });
    console.log(`Verification SID: ${verification.sid}`);
    return res.json({
      status: "success",
      data: { message: "OTP sent successfully" },
    });
  } catch (e) {
    console.error("Couldn't send OTP: ", e);
    return res.status(500).json({
      message: "Failed to send OTP",
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
    });
  }
};

const checkOtp = async (req, res) => {
  const mobileNumber = req.body.mobileNumber;
  const otp = req.body.otp;

  const requestId = generateReqId();

  if (!mobileNumber || !otp)
    return res.status(400).json({
      message: "Mobile number or otp code missing.",
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
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
        let tokenId = user ? user.id : null;
        let responseUser = user; // to be sent in response
        if (!user) {
          const newUser = await db.user.create({
            data: {
              mobileNumber,
            },
          });
          tokenId = newUser.id;
          responseUser = newUser;
        }
        const token = generateToken(tokenId);
        delete responseUser.password;
        return res.json({
          status: "success",
          data: {
            success: true,
            message: "OTP verified successfully",
            user: responseUser,
            token,
          },
        });
      } catch (e) {
        console.error(e);
        return res.status(500).json({
          message: "Unable to create account",
          status: "error",
          code: 500,
          timestamp: new Date(),
          requestId,
        });
      }
    }
    return res.status(400).json({
      status: "error",
      code: 400,
      timestamp: new Date(),
      requestId,
      message: "Invalid OTP",
    });
  } catch (e) {
    console.error("Error verifying OTP:", e);
    res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Failed to verify OTP",
    });
  }
};

module.exports = {
  sendOtp,
  checkOtp,
};
