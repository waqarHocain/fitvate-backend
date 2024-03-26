const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getWorkoutPlans = async (req, res) => {
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
    const plans = await db.workoutPlan.findMany({
      where: { userId },
    });
    return res.json({
      status: "success",
      data: {
        plans,
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

const addWorkoutPlan = async (req, res) => {
  const { id: userId } = req.params;
  const { workoutPlanId } = req.body;

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

  if (!workoutPlanId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing workout plan id",
    });
  }

  try {
    const existingPlan = await db.workoutPlan.findUnique({
      where: {
        workoutPlanId,
      },
    });
    if (existingPlan) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Workout Plan Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }

    const plan = await db.workoutPlan.create({
      data: {
        workoutPlanId,
        userId,
      },
    });

    return res.json({
      status: "success",
      data: {
        plan,
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

const removeWorkoutPlan = async (req, res) => {
  const { id: userId } = req.params;
  const { workoutPlanId } = req.body;

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

  if (!workoutPlanId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Workout plan id",
    });
  }

  try {
    await db.workoutPlan.delete({
      where: {
        workoutPlanId,
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
  getWorkoutPlans,
  addWorkoutPlan,
  removeWorkoutPlan,
};
