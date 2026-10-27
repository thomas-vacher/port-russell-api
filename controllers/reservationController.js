const mongoose = require("mongoose");

const Catway = require("../models/Catway");
const Reservation = require("../models/Reservation");

/**
 * Vérifie et transforme un numéro de catway.
 *
 * @param {string} value Valeur reçue dans l'adresse.
 * @returns {number|null} Numéro valide ou null.
 */
function getCatwayNumber(value) {
  const catwayNumber = Number(value);

  if (!Number.isInteger(catwayNumber) || catwayNumber < 1) {
    return null;
  }

  return catwayNumber;
}

/**
 * Vérifie qu'un catway existe.
 *
 * @param {number} catwayNumber Numéro du catway.
 * @returns {Promise<boolean>} True si le catway existe.
 */
async function catwayExists(catwayNumber) {
  const catway = await Catway.exists({ catwayNumber });

  return Boolean(catway);
}

/**
 * Vérifie que les deux dates sont valides et dans le bon ordre.
 *
 * @param {string} startDate Date de début.
 * @param {string} endDate Date de fin.
 * @returns {boolean} True si la période est valide.
 */
function hasValidDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return !Number.isNaN(start.getTime())
    && !Number.isNaN(end.getTime())
    && end > start;
}

/**
 * Renvoie les réservations d'un catway.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function listReservations(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);

    if (!catwayNumber) {
      res.status(400).json({ message: "Numéro de catway invalide." });
      return;
    }

    if (!await catwayExists(catwayNumber)) {
      res.status(404).json({ message: "Catway introuvable." });
      return;
    }

    const reservations = await Reservation.find({ catwayNumber })
      .sort({ startDate: 1 });

    res.status(200).json(reservations);
  } catch (error) {
    next(error);
  }
}

/**
 * Renvoie une réservation précise d'un catway.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function getReservation(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const { idReservation } = req.params;

    if (!catwayNumber || !mongoose.isValidObjectId(idReservation)) {
      res.status(400).json({ message: "Identifiant de réservation invalide." });
      return;
    }

    const reservation = await Reservation.findOne({
      _id: idReservation,
      catwayNumber
    });

    if (!reservation) {
      res.status(404).json({ message: "Réservation introuvable." });
      return;
    }

    res.status(200).json(reservation);
  } catch (error) {
    next(error);
  }
}

/**
 * Crée une réservation pour un catway.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function createReservation(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const { clientName, boatName, startDate, endDate } = req.body;

    if (!catwayNumber) {
      res.status(400).json({ message: "Numéro de catway invalide." });
      return;
    }

    if (!await catwayExists(catwayNumber)) {
      res.status(404).json({ message: "Catway introuvable." });
      return;
    }

    if (!hasValidDateRange(startDate, endDate)) {
      res.status(400).json({
        message: "Les dates de réservation sont invalides."
      });
      return;
    }

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate,
      endDate
    });

    res.status(201).json(reservation);
  } catch (error) {
    next(error);
  }
}

/**
 * Modifie une réservation.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function updateReservation(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const { idReservation } = req.params;
    const { clientName, boatName, startDate, endDate } = req.body;

    if (!catwayNumber || !mongoose.isValidObjectId(idReservation)) {
      res.status(400).json({ message: "Identifiant de réservation invalide." });
      return;
    }

    if (!hasValidDateRange(startDate, endDate)) {
      res.status(400).json({
        message: "Les dates de réservation sont invalides."
      });
      return;
    }

    const reservation = await Reservation.findOneAndUpdate(
      { _id: idReservation, catwayNumber },
      { clientName, boatName, startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!reservation) {
      res.status(404).json({ message: "Réservation introuvable." });
      return;
    }

    res.status(200).json(reservation);
  } catch (error) {
    next(error);
  }
}

/**
 * Supprime une réservation.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteReservation(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const { idReservation } = req.params;

    if (!catwayNumber || !mongoose.isValidObjectId(idReservation)) {
      res.status(400).json({ message: "Identifiant de réservation invalide." });
      return;
    }

    const reservation = await Reservation.findOneAndDelete({
      _id: idReservation,
      catwayNumber
    });

    if (!reservation) {
      res.status(404).json({ message: "Réservation introuvable." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation
};