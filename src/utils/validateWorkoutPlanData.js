/*
  {
    planId: str,
    planName: str,
    weeks: [
      {
        weekId: str,
        days: [
          {
            dayId: str,
            exercises: [
              {
                exerciseId: str,
                weightUsed: str,
                displayIndex: int,
              }
            ]
          }
        ]
      }
    ]
  }
*/
const isValidWorkoutPlan = (data) => {
  if (!data.planId || !data.planName) return false;
  const { weeks } = data;

  const isValid = true;

  weeks.forEach((week) => {
    if (!week.weekId) {
      isValid = false;
      return null;
    }
    const days = week.days;
    if (days.length > 0) {
      days.forEach((day) => {
        if (!day.dayId) {
          isValid = false;
          return null;
        }
        const exercises = day.exercises;
        exercises.forEach((exercise) => {
          if (
            !exercise.exerciseId ||
            !exercise.weightUsed ||
            !exercise.displayIndex
          ) {
            isValid = false;
            return null;
          }
        });
      });
    }
  });

  if (!isValid) return false;

  return true;
};

module.exports = { isValidWorkoutPlan };
