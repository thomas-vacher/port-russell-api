const mongoose = require("mongoose");

const Catway = require("../models/Catway");
const Reservation = require("../models/Reservation");

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
 * Transforme une erreur de validation en message lisible.
 *
 * @param {Error} error Erreur levée par Mongoose.
 * @returns {string|null} Message à afficher, ou null si l'erreur est inattendue.
 */
function getErrorMessage(error) {
  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((item) => item.message).join(" ");
  }

  return null;
}

/**
 * Affiche la liste des réservations, avec un message éventuel.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {string|null} error Message d'erreur à afficher.
 * @returns {Promise<void>}
 */
async function renderList(req, res, error = null) {
  const reservations = await Reservation.find()
    .sort({ startDate: -1 });
  const catways = await Catway.find().sort({ catwayNumber: 1 });

  res.render("reservations/list", {
    title: "Réservations",
    user: req.session.user,
    reservations,
    catways,
    error
  });
}

/**
 * Affiche la liste des réservations.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showReservations(req, res, next) {
  try {
    await renderList(req, res);
  } catch (error) {
    next(error);
  }
}

/**
 * Cherche une réservation à partir de son identifiant dans l'adresse.
 *
 * @param {string} id Identifiant reçu dans l'adresse.
 * @returns {Promise<object|null>} La réservation ou null.
 */
async function findReservation(id) {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return Reservation.findById(id);
}

/**
 * Affiche le détail d'une réservation.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showReservation(req, res, next) {
  try {
    const reservation = await findReservation(req.params.id);

    if (!reservation) {
      res.status(404);
      await renderList(req, res, "Réservation introuvable.");
      return;
    }

    res.render("reservations/detail", {
      title: "Détail de la réservation",
      user: req.session.user,
      reservation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Affiche le formulaire de modification d'une réservation.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showEditForm(req, res, next) {
  try {
    const reservation = await findReservation(req.params.id);

    if (!reservation) {
      res.status(404);
      await renderList(req, res, "Réservation introuvable.");
      return;
    }

    res.render("reservations/edit", {
      title: "Modifier la réservation",
      user: req.session.user,
      reservation,
      error: null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crée une réservation depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function createReservation(req, res, next) {
  try {
    const { catwayNumber, clientName, boatName, startDate, endDate } = req.body;
    const number = Number(catwayNumber);

    if (!Number.isInteger(number) || !await Catway.exists({ catwayNumber: number })) {
      res.status(400);
      await renderList(req, res, "Catway introuvable.");
      return;
    }

    if (!hasValidDateRange(startDate, endDate)) {
      res.status(400);
      await renderList(req, res, "Les dates de réservation sont invalides.");
      return;
    }

    await Reservation.create({
      catwayNumber: number,
      clientName,
      boatName,
      startDate,
      endDate
    });

    res.redirect("/dashboard/reservations");
  } catch (error) {
    const message = getErrorMessage(error);

    if (!message) {
      next(error);
      return;
    }

    try {
      res.status(400);
      await renderList(req, res, message);
    } catch (renderError) {
      next(renderError);
    }
  }
}

/**
 * Modifie une réservation depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function updateReservation(req, res, next) {
  try {
    const reservation = await findReservation(req.params.id);

    if (!reservation) {
      res.status(404);
      await renderList(req, res, "Réservation introuvable.");
      return;
    }

    const { clientName, boatName, startDate, endDate } = req.body;

    if (!hasValidDateRange(startDate, endDate)) {
      res.status(400).render("reservations/edit", {
        title: "Modifier la réservation",
        user: req.session.user,
        reservation,
        error: "Les dates de réservation sont invalides."
      });
      return;
    }

    reservation.clientName = clientName;
    reservation.boatName = boatName;
    reservation.startDate = startDate;
    reservation.endDate = endDate;

    await reservation.save();

    res.redirect("/dashboard/reservations");
  } catch (error) {
    const message = getErrorMessage(error);

    if (!message) {
      next(error);
      return;
    }

    try {
      const reservation = await findReservation(req.params.id);

      res.status(400).render("reservations/edit", {
        title: "Modifier la réservation",
        user: req.session.user,
        reservation,
        error: message
      });
    } catch (renderError) {
      next(renderError);
    }
  }
}

/**
 * Supprime une réservation depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteReservation(req, res, next) {
  try {
    if (mongoose.isValidObjectId(req.params.id)) {
      await Reservation.findByIdAndDelete(req.params.id);
    }

    res.redirect("/dashboard/reservations");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showReservations,
  showReservation,
  showEditForm,
  createReservation,
  updateReservation,
  deleteReservation
};