const router = require("express").Router();

const userController = require("../controllers/user.controller");

router
  .route("/:id")
  .get(userController.getProfile)
  .post(userController.updateProfile)
  .delete(userController.deleteProfile);

module.exports = router;
