const router = require("express").Router();

const db = require("../services/db");
const { todayDate } = require("../utils/todaysDate");
const { generateReqId } = require("../utils/generateReqId");

router.get("/dau", async (req, res) => {
  const requestId = generateReqId();
  const date = todayDate();

  let activeUsers;
  try {
    activeUsers = await db.dailyActiveUser.findUnique({
      where: {
        date,
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

  if (!activeUsers)
    return res.json({
      date,
      "Active Users": 0,
    });

  return res.json({
    date,
    "Active Users": activeUsers.counter,
  });
});

module.exports = router;
