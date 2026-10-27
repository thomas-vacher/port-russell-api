const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * Prépare un utilisateur pour la réponse, sans son mot de passe.
 *
 * @param {object} user Utilisateur issu de MongoDB.
 * @returns {{_id: string, username: string, email: string}} Données publiques.
 */
function formatUser(user) {
  return {
    _id: user._id,
    username: user.username,
    email: user.email
  };
}

/**
 * Vérifie qu'un mot de passe est une chaîne d'au moins 8 caractères.
 *
 * @param {*} password Valeur reçue.
 * @returns {boolean} True si le mot de passe est valide.
 */
function isValidPassword(password) {
  return typeof password === "string" && password.length >= 8;
}

/**
 * Liste tous les utilisateurs.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ username: 1 });

    res.status(200).json(users.map(formatUser));
  } catch (error) {
    next(error);
  }
}

/**
 * Renvoie un utilisateur à partir de son adresse e-mail.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function getUser(req, res, next) {
  try {
    const email = String(req.params.email).toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }

    res.status(200).json(formatUser(user));
  } catch (error) {
    next(error);
  }
}

/**
 * Crée un utilisateur.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function createUser(req, res, next) {
  try {
    const { username, email, password } = req.body;

    if (!isValidPassword(password)) {
      res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères."
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json(formatUser(user));
  } catch (error) {
    next(error);
  }
}

/**
 * Modifie le nom et/ou le mot de passe d'un utilisateur.
 * L'adresse e-mail sert d'identifiant et ne change pas.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function updateUser(req, res, next) {
  try {
    const email = String(req.params.email).toLowerCase();
    const { username, password } = req.body;
    const changes = {};

    if (username !== undefined) {
      changes.username = username;
    }

    if (password !== undefined && password !== "") {
      if (!isValidPassword(password)) {
        res.status(400).json({
          message: "Le mot de passe doit contenir au moins 8 caractères."
        });
        return;
      }

      changes.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findOneAndUpdate(
      { email },
      changes,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }

    res.status(200).json(formatUser(user));
  } catch (error) {
    next(error);
  }
}

/**
 * Supprime un utilisateur.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteUser(req, res, next) {
  try {
    const email = String(req.params.email).toLowerCase();
    const user = await User.findOneAndDelete({ email });

    if (!user) {
      res.status(404).json({ message: "Utilisateur introuvable." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};