const db = require("../services/db");
const { generateReqId } = require("../utils/generateReqId");

const getReminders = async (req, res) => {
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
    const reminders = await db.reminder.findMany({
      where: { userId },
      include: {
        repeatDays: {
          select: {
            dayNum: true,
          },
        },
      },
    });
    return res.json({
      status: "success",
      data: {
        reminders,
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

const addReminder = async (req, res) => {
  const requestId = generateReqId();
  const { id: userId } = req.params;
  const { reminderId, reminderName, reminderTime, status, uuid, repeatDays } =
    req.body;

  if (
    !reminderId ||
    !reminderName ||
    !reminderTime ||
    !status ||
    !uuid ||
    !repeatDays
  ) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing reminder data",
    });
  }

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

  try {
    const existingReminder = await db.reminder.findUnique({
      where: {
        reminderId,
      },
    });
    if (existingReminder) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Reminder Already Exist",
        timestamp: new Date(),
        request_id: requestId,
      });
    }

    const repeatDaysData = [];
    if (repeatDays.length > 0) {
      repeatDays.forEach((d) => {
        repeatDaysData.push({
          dayNum: d,
        });
      });
    }
    const reminder = await db.reminder.create({
      data: {
        reminderId,
        reminderName,
        reminderTime,
        status,
        uuid,
        userId,
        repeatDays: {
          create: [...repeatDaysData],
        },
      },
      include: {
        repeatDays: {
          select: {
            dayNum: true,
          },
        },
      },
    });

    return res.json({
      status: "success",
      data: {
        reminder,
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

const removeReminder = async (req, res) => {
  const { id: userId } = req.params;
  const { reminderId } = req.body;

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

  if (!reminderId) {
    return res.status(422).json({
      status: "error",
      code: 422,
      timestamp: new Date(),
      requestId,
      message: "Missing reminder id",
    });
  }

  try {
    await db.reminder.delete({
      where: {
        reminderId,
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
  getReminders,
  addReminder,
  removeReminder,
};
