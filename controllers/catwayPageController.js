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
 * Transforme une erreur de validation ou de doublon en message lisible.
 *
 * @param {Error} error Erreur levée par Mongoose.
 * @returns {string|null} Message à afficher, ou null si l'erreur est inattendue.
 */
function getErrorMessage(error) {
  if (error.name === "ValidationError") {
    return Object.values(error.errors).map((item) => item.message).join(" ");
  }

  if (error.code === 11000) {
    return "Ce numéro de catway existe déjà.";
  }

  return null;
}

/**
 * Affiche la page de liste des catways, avec un message éventuel.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {string|null} error Message d'erreur à afficher.
 * @returns {Promise<void>}
 */
async function renderList(req, res, error = null) {
  const catways = await Catway.find().sort({ catwayNumber: 1 });

  res.render("catways/list", {
    title: "Catways",
    user: req.session.user,
    catways,
    error
  });
}

/**
 * Affiche la liste des catways.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showCatways(req, res, next) {
  try {
    await renderList(req, res);
  } catch (error) {
    next(error);
  }
}

/**
 * Affiche le détail d'un catway et ses réservations.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showCatway(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const catway = catwayNumber
      ? await Catway.findOne({ catwayNumber })
      : null;

    if (!catway) {
      res.status(404).render("catways/list", {
        title: "Catways",
        user: req.session.user,
        catways: await Catway.find().sort({ catwayNumber: 1 }),
        error: "Catway introuvable."
      });
      return;
    }

    const reservations = await Reservation.find({ catwayNumber })
      .sort({ startDate: 1 });

    res.render("catways/detail", {
      title: `Catway ${catway.catwayNumber}`,
      user: req.session.user,
      catway,
      reservations
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crée un catway depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function createCatway(req, res, next) {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    await Catway.create({ catwayNumber, catwayType, catwayState });

    res.redirect("/dashboard/catways");
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
 * Modifie uniquement l'état d'un catway depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function updateCatway(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);
    const { catwayState } = req.body;

    if (!catwayNumber) {
      res.redirect("/dashboard/catways");
      return;
    }

    await Catway.findOneAndUpdate(
      { catwayNumber },
      { catwayState },
      { runValidators: true }
    );

    res.redirect("/dashboard/catways");
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
 * Supprime un catway depuis le formulaire.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteCatway(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);

    if (catwayNumber) {
      await Catway.findOneAndDelete({ catwayNumber });
    }

    res.redirect("/dashboard/catways");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showCatways,
  showCatway,
  createCatway,
  updateCatway,
  deleteCatway
};