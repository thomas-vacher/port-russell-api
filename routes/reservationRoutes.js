const express = require("express");

const router = express.Router();

const reservationController = require(
  "../controllers/reservationController"
);

/**
 * Liste des réservations d'un catway.
 */
router.get(
  "/:id/reservations",
  reservationController.listReservations
);

/**
 * Détail d'une réservation.
 */
router.get(
  "/:id/reservations/:idReservation",
  reservationController.getReservation
);

/**
 * Création d'une réservation.
 */
router.post(
  "/:id/reservations",
  reservationController.createReservation
);

/**
 * Modification d'une réservation.
 */
router.put(
  "/:id/reservations/:idReservation",
  reservationController.updateReservation
);

/**
 * Suppression d'une réservation.
 */
router.delete(
  "/:id/reservations/:idReservation",
  reservationController.deleteReservation
);

module.exports = router;