const router = require("express").Router();

const userController = require("../controllers/user.controller");
const ordersController = require("../controllers/orders.controller");

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

module.exports = router;
