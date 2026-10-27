const express = require("express");

const router = express.Router();

const controller = require("../controllers/catwayPageController");

/**
 * Routes des pages de gestion des catways.
 */
router.get("/", controller.showCatways);
router.post("/", controller.createCatway);
router.get("/:id", controller.showCatway);
router.post("/:id/update", controller.updateCatway);
router.post("/:id/delete", controller.deleteCatway);

module.exports = router;