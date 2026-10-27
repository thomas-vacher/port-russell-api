const Reservation = require("../models/Reservation");

/**
 * Affiche le tableau de bord avec les réservations en cours.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showDashboard(req, res, next) {
  try {
    const now = new Date();

    const reservations = await Reservation.find({
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ catwayNumber: 1 });

    res.render("dashboard", {
      title: "Tableau de bord",
      user: req.session.user,
      today: now,
      reservations
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { showDashboard };