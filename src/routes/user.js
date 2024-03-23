const router = require("express").Router();

const userController = require("../controllers/user.controller");
const ordersController = require("../controllers/orders.controller");
const exercisesController = require("../controllers/exercises.controller");

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

module.exports = router;
