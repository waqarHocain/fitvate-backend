const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");
const { isValidWorkoutPlan } = require("../utils/validateWorkoutPlanData");

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
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });

    plans.forEach((p) => delete p.userId);
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
  const requestId = generateReqId();
  const { id: userId } = req.params;

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

  // check for required fields
  const isValidData = isValidWorkoutPlan(req.body);
  console.log(isValidData);
  if (!isValidData) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing workout plan data",
    });
  }

  const planData = {
    planId: req.body.planId,
    planName: req.body.planName,
  };
  if (req.body.planDescription)
    planData.planDescription = req.body.planDescription;
  if (req.body.planThemeColor)
    planData.planThemeColor = req.body.planThemeColor;
  if (req.body.planCategory) planData.planCategory = req.body.planCategory;
  if (req.body.isPurchased) planData.isPurchased = req.body.isPurchased;
  if (req.body.duration) planData.duration = req.body.duration;
  if (req.body.goal) planData.goal = req.body.goal;
  if (req.body.planType) planData.planType = req.body.planType;

  const { weeks } = req.body;

  // populate weeks data
  const weeksData = [];
  weeks.forEach((week) => {
    const obj = { weekId: week.weekId, days: [] };
    if (week.isCompleted) obj.isCompleted = week.isCompleted;

    if (week.days.length > 0) {
      week.days.forEach((day) => {
        const dayObj = { dayId: day.dayId, exercises: [] };
        if (day.isCompleted) dayObj.isCompleted = day.isCompleted;
        if (day.exercises.length > 0) {
          day.exercises.forEach((ex) => {
            const exerciseObj = {
              exerciseId: ex.exerciseId,
              weightUsed: ex.weightUsed,
              displayIndex: ex.displayIndex,
            };
            if (ex.isCompleted) exerciseObj.isCompleted = ex.isCompleted;
            dayObj.exercises.push(exerciseObj);
          });
        }
        obj.days.push(dayObj);
      });
    }
    weeksData.push(obj);
  });

  try {
    const existingPlan = await db.workoutPlan.findUnique({
      where: {
        planId: planData.planId,
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
        ...planData,
        userId: userId,
      },
    });

    for (const wkData of weeksData) {
      const week = await db.week.create({
        data: {
          weekId: wkData.weekId,
          isCompleted: wkData.isCompleted ? true : false,
          workoutPlanId: plan.id,
        },
      });

      // days
      for (const dayData of wkData.days) {
        await db.day.create({
          data: {
            dayId: dayData.dayId,
            isCompleted: dayData.isCompleted ? true : false,
            weekId: week.id,
            exercises: {
              createMany: {
                data: [...dayData.exercises],
              },
            },
          },
        });
      }
    }

    const result = await db.workoutPlan.findUnique({
      where: {
        planId: planData.planId,
      },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: true,
              },
            },
          },
        },
      },
    });
    delete result.userId;

    return res.json({
      status: "success",
      data: {
        plan: result,
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
        planId: workoutPlanId,
      },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: true,
              },
            },
          },
        },
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
