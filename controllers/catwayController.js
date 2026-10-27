const Catway = require("../models/Catway");

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
 * Renvoie la liste de tous les catways.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function listCatways(req, res, next) {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });

    res.status(200).json(catways);
  } catch (error) {
    next(error);
  }
}

/**
 * Renvoie un catway à partir de son numéro.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function getCatway(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);

    if (!catwayNumber) {
      res.status(400).json({ message: "Numéro de catway invalide." });
      return;
    }

    const catway = await Catway.findOne({ catwayNumber });

    if (!catway) {
      res.status(404).json({ message: "Catway introuvable." });
      return;
    }

    res.status(200).json(catway);
  } catch (error) {
    next(error);
  }
}

/**
 * Crée un nouveau catway.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function createCatway(req, res, next) {
  try {
    const { catwayNumber, catwayType, catwayState } = req.body;

    const catway = await Catway.create({
      catwayNumber,
      catwayType,
      catwayState
    });

    res.status(201).json(catway);
  } catch (error) {
    next(error);
  }
}

/**
 * Modifie uniquement l'état d'un catway.
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
      res.status(400).json({ message: "Numéro de catway invalide." });
      return;
    }

    if (typeof catwayState !== "string" || catwayState.trim() === "") {
      res.status(400).json({ message: "L'état du catway est obligatoire." });
      return;
    }

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber },
      { catwayState: catwayState.trim() },
      { new: true, runValidators: true }
    );

    if (!catway) {
      res.status(404).json({ message: "Catway introuvable." });
      return;
    }

    res.status(200).json(catway);
  } catch (error) {
    next(error);
  }
}

/**
 * Supprime un catway.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteCatway(req, res, next) {
  try {
    const catwayNumber = getCatwayNumber(req.params.id);

    if (!catwayNumber) {
      res.status(400).json({ message: "Numéro de catway invalide." });
      return;
    }

    const catway = await Catway.findOneAndDelete({ catwayNumber });

    if (!catway) {
      res.status(404).json({ message: "Catway introuvable." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCatways,
  getCatway,
  createCatway,
  updateCatway,
  deleteCatway
};