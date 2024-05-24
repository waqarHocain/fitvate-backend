const db = require("../services/db");
const { getCache, setCache } = require("../services/redis");
const { todayDate } = require("../utils/todaysDate");

async function dailyActiveUsers(req, res, next) {
  const userId = req.user.id;
  const data = await getCache(userId);

  // skip if already counted
  if (data) {
    next();
    return;
  }

  const today = todayDate();

  try {
    const todayActives = await db.dailyActiveUser.findUnique({
      where: {
        date: today,
      },
    });

    // if there isn't any record for today, create a new record
    if (!todayActives) {
      await db.dailyActiveUser.create({
        data: {
          counter: 1,
          date: today,
        },
      });
      await setCache(userId, "active");
      next();
      return;
    }

    await db.dailyActiveUser.update({
      where: {
        date: today,
      },
      data: {
        counter: todayActives.counter + 1,
      },
    });

    await setCache(userId, "active");
    next();
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  dailyActiveUsers,
};
