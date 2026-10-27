const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

/**
 * Routes de gestion des utilisateurs.
 */
router.route("/")
  .get(userController.listUsers)
  .post(userController.createUser);

router.route("/:email")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;