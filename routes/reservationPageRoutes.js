const express = require("express");

const router = express.Router();

const controller = require("../controllers/reservationPageController");

/**
 * Routes des pages de gestion des réservations.
 */
router.get("/", controller.showReservations);
router.post("/", controller.createReservation);
router.get("/:id", controller.showReservation);
router.get("/:id/edit", controller.showEditForm);
router.post("/:id/update", controller.updateReservation);
router.post("/:id/delete", controller.deleteReservation);

module.exports = router;