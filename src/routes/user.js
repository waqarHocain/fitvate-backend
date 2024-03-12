const router = require("express").Router();

const userController = require("../controllers/user.controller");
const ordersController = require("../controllers/orders.controller");

// user profile
router
  .route("/:id")
  .get(userController.getProfile)
  .post(userController.updateProfile)
  .delete(userController.deleteProfile);

// orders
router
  .route("/:id/orders")
  .get(ordersController.getOrders)
  .post(ordersController.addOrder);

router.get("/:id/orders/:orderId", ordersController.verifyOrder);

module.exports = router;
