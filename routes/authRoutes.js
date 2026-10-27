const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

/**
 * Routes de connexion et de déconnexion.
 */
router.post("/login", authController.login);
router.get("/logout", authController.logout);

module.exports = router;