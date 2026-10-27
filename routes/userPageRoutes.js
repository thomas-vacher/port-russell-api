const express = require("express");

const router = express.Router();

const controller = require("../controllers/userPageController");

/**
 * Routes des pages de gestion des utilisateurs.
 */
router.get("/", controller.showUsers);
router.post("/", controller.createUser);
router.get("/:email", controller.showUser);
router.get("/:email/edit", controller.showEditForm);
router.post("/:email/update", controller.updateUser);
router.post("/:email/delete", controller.deleteUser);

module.exports = router;