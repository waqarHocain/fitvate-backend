const generateWeeksData = (numOfWeeks) => {
  const weeksData = [];

  for (let i = 0; i < numOfWeeks; i++) {
    weeksData.push({
      weekId: String(i + 1),
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
    });
  }

  return weeksData;
};

module.exports = { generateWeeksData };
