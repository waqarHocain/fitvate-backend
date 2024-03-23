const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getLikedExercises = async (req, res) => {
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
    const exercises = await db.likedExercise.findMany({
      where: {
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        exercises,
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

const addLikedExercise = async (req, res) => {
  const { id: userId } = req.params;
  const { exerciseId } = req.body;

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

  if (!exerciseId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing exercise id",
    });
  }

  try {
    const existingExercise = await db.likedExercise.findUnique({
      where: {
        exerciseId,
      },
    });
    if (existingExercise) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Exercise Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }

    const exercise = await db.likedExercise.create({
      data: {
        exerciseId,
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        exercise,
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

const removeLikedExercise = async (req, res) => {
  const { id: userId } = req.params;
  const { exerciseId } = req.body;

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

  if (!exerciseId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing exercise id",
    });
  }

  try {
    await db.likedExercise.delete({
      where: {
        exerciseId,
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
  getLikedExercises,
  addLikedExercise,
  removeLikedExercise,
};
