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

  // check provided plan id is valid
  const plan = await db.workoutPlan.findUnique({
    where: {
      planId: workoutPlanId,
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

  const { planId } = req.body;
  if (!planId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Workout Plan ID.",
    });
  }

  // populate plan data
  const planData = {};

  if (req.body.planName) planData.planName = req.body.planName;
  if (req.body.planDescription)
    planData.planDescription = req.body.planDescription;
  if (req.body.planThemeColor)
    planData.planThemeColor = req.body.planThemeColor;
  if (req.body.planCategory) planData.planCategory = req.body.planCategory;
  if (req.body.isPurchased) planData.isPurchased = req.body.isPurchased;
  if (req.body.duration) planData.duration = req.body.duration;
  if (req.body.goal) planData.goal = req.body.goal;
  if (req.body.planType) planData.planType = req.body.planType;

  // make sure that planId is valid
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
      where: {
        planId,
      },
      data: {
        ...planData,
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

const addWeek = async (req, res) => {
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

  const { workoutPlanId, weekId, isCompleted } = req.body;
  if (!workoutPlanId || !weekId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Workout Plan ID / Week ID.",
    });
  }

  // check workout plan id is valid
  const [plan, existingWeek] = await db.$transaction([
    db.workoutPlan.findUnique({
      where: {
        planId: workoutPlanId,
      },
    }),
    db.week.findUnique({
      where: {
        weekId,
      },
    }),
  ]);

  if (!plan) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Workout Plan Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }
  if (existingWeek) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Already a week exists with given weekId.",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const weekData = {
    weekId,
    workoutPlanId,
  };
  if (isCompleted) weekData.isCompleted = true;

  try {
    const week = await db.week.create({
      data: {
        ...weekData,
      },
    });

    return res.json({
      status: "success",
      data: {
        week,
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

const updateWeek = async (req, res) => {
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

  const { workoutPlanId, weekId, isCompleted } = req.body;
  if (!workoutPlanId || !weekId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Workout Plan ID / Week ID.",
    });
  }

  // check workout plan id is valid
  const [plan, existingWeek] = await db.$transaction([
    db.workoutPlan.findUnique({
      where: {
        planId: workoutPlanId,
      },
    }),
    db.week.findUnique({
      where: {
        weekId,
      },
    }),
  ]);

  if (!plan || !existingWeek) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Workout Plan Id / Week Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const weekData = {
    weekId,
    workoutPlanId,
  };
  if (isCompleted) weekData.isCompleted = true;

  try {
    const week = await db.week.update({
      where: {
        weekId,
      },
      data: {
        ...weekData,
      },
    });

    return res.json({
      status: "success",
      data: {
        week,
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

const addDay = async (req, res) => {
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

  const { weekId, dayId, isCompleted, exercises } = req.body;
  if (!weekId || !dayId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Day ID / Week ID.",
    });
  }

  // check  week id is valid
  const [week, existingDay] = await db.$transaction([
    db.week.findUnique({
      where: {
        weekId,
      },
    }),
    db.day.findUnique({
      where: {
        dayId,
      },
    }),
  ]);

  if (!week) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Week Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }
  if (existingDay) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Already a day exists with given dayId.",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  // validate exercise data
  let isValidExercisesData = true;

  if (exercises && exercises.length > 0) {
    for (const ex of exercises) {
      if (!ex.exerciseId || !ex.displayIndex || !ex.weightUsed) {
        isValidExercisesData = false;
      }
    }
  }
  if (!isValidExercisesData) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Invalid Exercise data",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const dayData = {
    weekId,
    dayId,
  };
  if (isCompleted) dayData.isCompleted = true;

  try {
    let day;
    if (exercises) {
      day = await db.day.create({
        data: {
          ...dayData,
          exercises: {
            createMany: {
              data: [...exercises],
            },
          },
        },
        include: {
          exercises: true,
        },
      });
    } else {
      day = await db.day.create({
        data: {
          ...dayData,
        },
      });
    }

    return res.json({
      status: "success",
      data: {
        day,
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

const updateDay = async (req, res) => {
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

  const { weekId, dayId, isCompleted } = req.body;
  if (!weekId || !dayId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Day ID / Week ID.",
    });
  }

  // check  week id is valid
  const [week, existingDay] = await db.$transaction([
    db.week.findUnique({
      where: {
        weekId,
      },
    }),
    db.day.findUnique({
      where: {
        dayId,
      },
    }),
  ]);

  if (!week || !existingDay) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Week Id / Day Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const dayData = {
    weekId,
    dayId,
  };
  if (isCompleted) dayData.isCompleted = true;

  try {
    const day = await db.day.update({
      where: {
        dayId,
      },
      data: {
        ...dayData,
      },
    });

    return res.json({
      status: "success",
      data: {
        day,
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

const addExercise = async (req, res) => {
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

  const { exerciseId, dayId, weightUsed, displayIndex, isCompleted } = req.body;
  if (!exerciseId || !dayId || !weightUsed || !displayIndex) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing required data.",
    });
  }

  // check  week id is valid
  const [existingExercise, day] = await db.$transaction([
    db.exercise.findUnique({
      where: {
        exerciseId,
      },
    }),
    db.day.findUnique({
      where: {
        dayId,
      },
    }),
  ]);

  if (!day) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Week Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }
  if (existingExercise) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Already an exercise exists with given exerciseId.",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  const exData = {
    dayId,
    exerciseId,
    weightUsed,
    displayIndex,
  };
  if (isCompleted) exData.isCompleted = true;

  try {
    const exercise = await db.exercise.create({
      data: {
        ...exData,
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

module.exports = {
  getWorkoutPlans,
  addWorkoutPlan,
  removeWorkoutPlan,
  updateWorkoutPlan,
  addWeek,
  updateWeek,
  addDay,
  updateDay,
  addExercise,
};
