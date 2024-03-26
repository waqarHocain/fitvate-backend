const router = require("express").Router();

const userController = require("../controllers/user.controller");
const ordersController = require("../controllers/orders.controller");
const exercisesController = require("../controllers/exercises.controller");
const articlesController = require("../controllers/likedArticles.controller");
const workoutPlansController = require("../controllers/workoutPlan.controller");
const challengesController = require("../controllers/challenges.controller");
const remindersController = require("../controllers/reminders.controller");

// user profile
router
  .route("/:id")
  .get(userController.getProfile)
  .put(userController.updateProfile)
  .delete(userController.deleteProfile);

// orders
router
  .route("/:id/orders")
  .get(ordersController.getOrders)
  .post(ordersController.addOrder);

// liked exercises
router
  .route("/:id/liked-exercises")
  .get(exercisesController.getLikedExercises)
  .post(exercisesController.addLikedExercise)
  .delete(exercisesController.removeLikedExercise);

// liked articles
router
  .route("/:id/liked-articles")
  .get(articlesController.getLikedArticles)
  .post(articlesController.addLikedArticle)
  .delete(articlesController.removeLikedArticle);

// workout plans
router
  .route("/:id/workout-plans")
  .get(workoutPlansController.getWorkoutPlans)
  .post(workoutPlansController.addWorkoutPlan)
  .delete(workoutPlansController.removeWorkoutPlan);

// challenges
router
  .route("/:id/challenges")
  .get(challengesController.getChallenges)
  .post(challengesController.addChallenge)
  .delete(challengesController.removeChallenge);

// reminders
router
  .route("/:id/reminders")
  .get(remindersController.getReminders)
  .post(remindersController.addReminder)
  .delete(remindersController.removeReminder);

module.exports = router;
