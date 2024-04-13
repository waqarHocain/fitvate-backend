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
    const obj = {
      create: { weekId: week.weekId, days: { connectOrCreate: [] } },
      where: { weekId: week.weekId },
    };
    if (week.isCompleted !== undefined)
      obj.create.isCompleted = week.isCompleted;

    if (week.days.length > 0) {
      week.days.forEach((day) => {
        const dayObj = {
          where: { dayId: day.dayId },
          create: { dayId: day.dayId, exercises: { connectOrCreate: [] } },
        };
        if (day.isCompleted !== undefined)
          dayObj.create.isCompleted = day.isCompleted;

        if (day.exercises.length > 0) {
          day.exercises.forEach((ex) => {
            const exerciseObj = {
              create: {
                exerciseId: ex.exerciseId,
                weightUsed: ex.weightUsed,
                displayIndex: parseInt(ex.displayIndex),
              },
              where: {
                exerciseId: ex.exerciseId,
              },
            };
            if (ex.isCompleted !== undefined)
              exerciseObj.create.isCompleted = ex.isCompleted;
            dayObj.create.exercises.connectOrCreate.push(exerciseObj);
          });
        }
        obj.create.days.connectOrCreate.push(dayObj);
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
        weeks: {
          connectOrCreate: [...weeksData],
        },
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

const updateWorkoutPlan = async (req, res) => {
  const { id: userId } = req.params;
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

  const { planId, weeks } = req.body;

  // check if payload data is valid
  let isValidPayload = true;
  if (!planId || !weeks || weeks.length === 0) isValidPayload = false;
  weeks.forEach((wk) => {
    if (!wk.weekId) isValidPayload = false;
    if (wk.days && wk.days.length > 0) {
      wk.days.forEach((day) => {
        if (!day.dayId) isValidPayload = false;
        if (day.exercises && day.exercises.length > 0) {
          day.exercises.forEach((ex) => {
            if (!ex.exerciseId) isValidPayload = false;
          });
        }
      });
    }
  });

  if (!isValidPayload) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Workout plan data",
    });
  }

  // populate plan data
  const planData = {
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

  // populate weeks data
  const weeksData = [];
  weeks.forEach((week) => {
    const obj = {
      where: { weekId: week.weekId },
      create: { weekId: week.weekId, days: { connectOrCreate: [] } },
      update: { weekId: week.weekId, days: { upsert: [] } },
    };
    obj.create.isCompleted = week.isCompleted ? true : false;
    obj.update.isCompleted = week.isCompleted ? true : false;

    if (week.days && week.days.length > 0) {
      week.days.forEach((day) => {
        const dayObj = {
          where: { dayId: day.dayId },
          create: { dayId: day.dayId, exercises: { connectOrCreate: [] } },
        };
        const dayUpdate = {
          update: { dayId: day.dayId, exercises: { upsert: [] } },
        };
        dayObj.create.isCompleted = day.isCompleted ? true : false;
        dayUpdate.update.isCompleted = day.isCompleted ? true : false;

        if (day.exercises && day.exercises.length > 0) {
          day.exercises.forEach((ex) => {
            const exerciseObj = {
              where: { exerciseId: ex.exerciseId },
              create: {
                exerciseId: ex.exerciseId,
                weightUsed: ex.weightUsed,
                displayIndex: parseInt(ex.displayIndex),
              },
            };
            const exUpdate = {
              update: {
                exerciseId: ex.exerciseId,
                weightUsed: ex.weightUsed,
                displayIndex: parseInt(ex.displayIndex),
              },
            };
            exerciseObj.create.isCompleted = ex.isCompleted ? true : false;
            exUpdate.update.isCompleted = ex.isCompleted ? true : false;

            dayObj.create.exercises.connectOrCreate.push(exerciseObj);
            dayUpdate.update.exercises.upsert.push({
              ...exerciseObj,
              ...exUpdate,
            });
          });
        }
        obj.create.days.connectOrCreate.push(dayObj);
        obj.update.days.upsert.push({ ...dayObj, ...dayUpdate });
      });
    }

    weeksData.push(obj);
  });

  const plan = await db.workoutPlan.findUnique({
    where: {
      planId,
    },
  });
  if (!plan) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Workout Plan Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  try {
    const updatedPlan = await db.workoutPlan.update({
      where: { planId },
      data: {
        ...planData,
        weeks: {
          upsert: [...weeksData],
        },
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
      data: {
        plan: updatedPlan,
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

module.exports = {
  getWorkoutPlans,
  addWorkoutPlan,
  removeWorkoutPlan,
  updateWorkoutPlan,
};
