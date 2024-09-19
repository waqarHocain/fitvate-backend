const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");
const { generateWeeksData } = require("../utils/generateWeeksData");

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
  const { planId, planName, duration } = req.body;
  if (!planId || !planName || !duration) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing workout plan data",
    });
  }

  const planData = {
    planId,
    planName,
    duration: String(duration),
  };
  if (req.body.planDescription)
    planData.planDescription = req.body.planDescription;
  if (req.body.planThemeColor)
    planData.planThemeColor = req.body.planThemeColor;
  if (req.body.planCategory) planData.planCategory = req.body.planCategory;
  if (req.body.isPurchased) planData.isPurchased = req.body.isPurchased;
  if (req.body.goal) planData.goal = req.body.goal;
  if (req.body.planType) planData.planType = req.body.planType;

  // populate weeks data
  const weeksData = generateWeeksData(parseInt(duration));

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

    const updatedWeeksData = weeksData.map((wkData) => {
      return { ...wkData, workoutPlanId: plan.planId };
    });

    const weeks = await db.$transaction(
      updatedWeeksData.map((wkData) =>
        db.week.create({
          data: { ...wkData },
          include: { days: { include: { exercises: true } } },
        })
      )
    );

    return res.json({
      status: "success",
      data: {
        ...plan,
        weeks: [...weeks],
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
        weekId_workoutPlanId: {
          weekId: weekId,
          workoutPlanId: workoutPlanId,
        },
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
    days: {
      createMany: {
        data: [
          { dayId: "1" },
          { dayId: "2" },
          { dayId: "3" },
          { dayId: "4" },
          { dayId: "5" },
          { dayId: "6" },
          { dayId: "7" },
        ],
      },
    },
  };
  if (isCompleted) weekData.isCompleted = true;

  try {
    const week = await db.week.create({
      data: {
        ...weekData,
      },
      include: {
        days: {
          include: {
            exercises: true,
          },
        },
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
        weekId_workoutPlanId: {
          weekId,
          workoutPlanId,
        },
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
    isCompleted: isCompleted ? true : false,
  };

  try {
    const week = await db.week.update({
      where: {
        weekId_workoutPlanId: {
          weekId,
          workoutPlanId,
        },
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

  const {
    workoutPlanId,
    weekId,
    dayId,
    isCompleted,
    isRestDay,
    completionPercentage,
    exercises,
  } = req.body;
  if (!workoutPlanId || !weekId || !dayId) {
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
        weekId_workoutPlanId: {
          weekId,
          workoutPlanId,
        },
      },
    }),
    db.day.findUnique({
      where: {
        dayId_weekId: {
          dayId,
          weekId,
        },
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
    dayId,
    weekId,
    workoutPlanId,
    isCompleted: isCompleted ? true : false,
  };
  if (isRestDay) dayData.isRestDay = isRestDay;
  if (completionPercentage) dayData.completionPercentage = completionPercentage;

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

  const {
    workoutPlanId,
    weekId,
    dayId,
    isCompleted,
    isRestDay,
    completionPercentage,
  } = req.body;

  if (!workoutPlanId || !weekId || !dayId) {
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
        weekId_workoutPlanId: {
          weekId,
          workoutPlanId,
        },
      },
    }),
    db.day.findUnique({
      where: {
        dayId_weekId_workoutPlanId: {
          dayId,
          weekId,
          workoutPlanId,
        },
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
    workoutPlanId,
  };

  if (isCompleted === true) {
    dayData.isCompleted = true;
    // mark that day all exercises as completed
    try {
      await db.exercise.updateMany({
        where: {
          workoutPlanId: workoutPlanId,
          weekId: weekId,
          dayId: dayId,
        },
        data: {
          isCompleted: true,
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: "error",
        code: 500,
        timestamp: new Date(),
        requestId,
        message: "Unable to set exercises is completed!",
      });
    }
  } else {
    dayData.isCompleted = false;
  }

  if (isRestDay === true) {
    dayData.isRestDay = true;
    // delete all exercises for that day
    try {
      await db.exercise.deleteMany({
        where: {
          workoutPlanId: workoutPlanId,
          weekId: weekId,
          dayId: dayId,
        },
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({
        status: "error",
        code: 500,
        timestamp: new Date(),
        requestId,
        message: "Unable to delete all exercises!",
      });
    }
  } else {
    dayData.isRestDay = false;
  }

  if (completionPercentage) dayData.completionPercentage = completionPercentage;

  try {
    const day = await db.day.update({
      where: {
        dayId_weekId_workoutPlanId: {
          dayId,
          weekId,
          workoutPlanId,
        },
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

  const { exercises } = req.body;
  // check for required fields
  if (!exercises || exercises.length === 0) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing required data.",
    });
  }
  let isValidData = true;
  for (const ex of exercises) {
    const {
      exerciseId,
      weekId,
      dayId,
      workoutPlanId,
      weightUsed,
      displayIndex,
    } = ex;
    if (
      !exerciseId ||
      !dayId ||
      !weekId ||
      !workoutPlanId ||
      !weightUsed ||
      !displayIndex
    ) {
      isValidData = false;
      break;
    }
  }
  if (!isValidData) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing required data.",
    });
  }

  // check  for existing exercises & week id is valid
  const exData = {
    exIds: exercises.map((ex) => ex.exerciseId),
    dayIds: exercises.map((ex) => ex.dayId),
    weekIds: exercises.map((ex) => ex.weekId),
    workoutPlanIds: exercises.map((ex) => ex.workoutPlanId),
  };

  const [existingExercises, day] = await db.$transaction([
    db.exercise.findMany({
      where: {
        exerciseId: { in: exData.exIds },
        dayId: { in: exData.dayIds },
        weekId: { in: exData.weekIds },
        workoutPlanId: { in: exData.workoutPlanIds },
      },
    }),
    db.day.findUnique({
      where: {
        dayId_weekId_workoutPlanId: {
          dayId: exercises[0].dayId,
          weekId: exercises[0].weekId,
          workoutPlanId: exercises[0].workoutPlanId,
        },
      },
    }),
  ]);

  if (!day) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Workout Plan / Week Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }
  if (existingExercises && existingExercises.length > 0) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Already an exercise exists with given exerciseId.",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  try {
    const newExercises = await db.exercise.createMany({
      data: [...exercises],
    });

    return res.json({
      status: "success",
      data: {
        exercises: newExercises,
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

const updateExercise = async (req, res) => {
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

  const {
    exerciseId,
    dayId,
    weekId,
    workoutPlanId,
    displayIndex,
    weightUsed,
    rest,
    setsAndReps,
    isCompleted,
  } = req.body;

  console.log({ exerciseId, dayId, weekId, workoutPlanId });

  // check for required fields
  if (!exerciseId || !dayId || !weekId || !workoutPlanId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing required data, please provide all 4 ids.",
    });
  }

  // check provided exercise id is valid
  const exercise = await db.exercise.findUnique({
    where: {
      exerciseId_dayId_weekId_workoutPlanId: {
        exerciseId,
        dayId,
        weekId,
        workoutPlanId,
      },
    },
  });
  if (!exercise) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Exercise Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  // populate data
  const exerciseData = {};
  if (displayIndex) exerciseData.displayIndex = displayIndex;
  if (weightUsed) exerciseData.weightUsed = weightUsed;
  if (setsAndReps) exerciseData.setsAndReps = setsAndReps;
  if (rest) exerciseData.rest = rest;
  if (isCompleted) exerciseData.isCompleted = isCompleted;

  try {
    const updatedExercise = await db.exercise.update({
      where: {
        exerciseId_dayId_weekId_workoutPlanId: {
          exerciseId,
          dayId,
          weekId,
          workoutPlanId,
        },
      },
      data: { ...exerciseData },
    });

    return res.json({
      status: "success",
      data: {
        ...updatedExercise,
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

const removeExercise = async (req, res) => {
  const { id: userId } = req.params;
  const { exerciseId, dayId, weekId, workoutPlanId } = req.body;

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

  if (!exerciseId || !dayId || !weekId || !workoutPlanId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing Exercise id",
    });
  }

  // check provided exercise id is valid
  const exercise = await db.exercise.findUnique({
    where: {
      exerciseId_dayId_weekId_workoutPlanId: {
        exerciseId,
        dayId,
        weekId,
        workoutPlanId,
      },
    },
  });
  if (!exercise) {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Exercise Id is invalid",
      timestamp: new Date(),
      request_id: requestId,
    });
  }

  try {
    await db.exercise.delete({
      where: {
        exerciseId_dayId_weekId_workoutPlanId: {
          exerciseId,
          dayId,
          weekId,
          workoutPlanId,
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
  updateWorkoutPlan,
  addWeek,
  updateWeek,
  addDay,
  updateDay,
  addExercise,
  updateExercise,
  removeExercise,
};
