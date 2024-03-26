const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getChallenges = async (req, res) => {
  const { id: userId } = req.params;
  const requestId = generateReqId();
  // only logged in user should be able to retrieve data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  try {
    const challenges = await db.challenge.findMany({
      where: { userId },
    });
    return res.json({
      status: "success",
      data: {
        challenges,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

const addChallenge = async (req, res) => {
  const { id: userId } = req.params;
  const { challengeId } = req.body;

  const requestId = generateReqId();
  // only logged in user should be able to update data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  if (!challengeId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing challenge id",
    });
  }

  try {
    const existingChallenge = await db.challenge.findUnique({
      where: {
        challengeId,
      },
    });
    if (existingChallenge) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Challenge Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }

    const challenge = await db.challenge.create({
      data: {
        challengeId,
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        challenge,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

const removeChallenge = async (req, res) => {
  const { id: userId } = req.params;
  const { challengeId } = req.body;

  const requestId = generateReqId();
  // only logged in user should be able to update data
  if (userId !== req.user.id) {
    return res.status(403).json({
      status: "error",
      code: 403,
      timestamp: new Date(),
      requestId,
      message: "Forbidden",
    });
  }

  if (!challengeId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Challenge id",
    });
  }

  try {
    await db.challenge.delete({
      where: {
        challengeId,
      },
    });

    return res.json({
      status: "success",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "error",
      code: 500,
      timestamp: new Date(),
      requestId,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getChallenges,
  addChallenge,
  removeChallenge,
};
