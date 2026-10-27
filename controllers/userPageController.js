const User = require("../models/User");
const bcrypt = require("bcrypt");

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
    return "Cette adresse e-mail est déjà utilisée.";
  }

  return null;
}

/**
 * Cherche un utilisateur à partir de son e-mail reçu dans l'adresse.
 *
 * @param {string} email Adresse e-mail.
 * @returns {Promise<object|null>} L'utilisateur ou null.
 */
async function findUser(email) {
  return User.findOne({ email: String(email).trim().toLowerCase() });
}

/**
 * Affiche la liste des utilisateurs, avec un message éventuel.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {string|null} error Message d'erreur à afficher.
 * @returns {Promise<void>}
 */
async function renderList(req, res, error = null) {
  const users = await User.find().sort({ username: 1 });

  res.render("users/list", {
    title: "Utilisateurs",
    user: req.session.user,
    users,
    error
  });
}

/**
 * Affiche la liste des utilisateurs.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showUsers(req, res, next) {
  try {
    await renderList(req, res);
  } catch (error) {
    next(error);
  }
}

/**
 * Affiche le détail d'un utilisateur.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showUser(req, res, next) {
  try {
    const target = await findUser(req.params.email);

    if (!target) {
      res.status(404);
      await renderList(req, res, "Utilisateur introuvable.");
      return;
    }

    res.render("users/detail", {
      title: "Détail de l'utilisateur",
      user: req.session.user,
      target
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Affiche le formulaire de modification d'un utilisateur.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function showEditForm(req, res, next) {
  try {
    const target = await findUser(req.params.email);

    if (!target) {
      res.status(404);
      await renderList(req, res, "Utilisateur introuvable.");
      return;
    }

    res.render("users/edit", {
      title: "Modifier l'utilisateur",
      user: req.session.user,
      target,
      error: null
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Crée un utilisateur depuis le formulaire.
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
      res.status(400);
      await renderList(
        req,
        res,
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ username, email, password: hashedPassword });

    res.redirect("/dashboard/users");
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
    const target = await findUser(req.params.email);

    if (!target) {
      res.status(404);
      await renderList(req, res, "Utilisateur introuvable.");
      return;
    }

    const { username, password } = req.body;

    const showError = (message) => res.status(400).render("users/edit", {
      title: "Modifier l'utilisateur",
      user: req.session.user,
      target,
      error: message
    });

    if (password && !isValidPassword(password)) {
      showError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    target.username = username;

    if (password) {
      target.password = await bcrypt.hash(password, 10);
    }

    try {
      await target.save();
    } catch (saveError) {
      const message = getErrorMessage(saveError);

      if (!message) {
        throw saveError;
      }

      showError(message);
      return;
    }

    if (target.email === req.session.user.email) {
      req.session.user.username = target.username;
    }

    res.redirect("/dashboard/users");
  } catch (error) {
    next(error);
  }
}

/**
 * Supprime un utilisateur depuis le formulaire.
 * Un utilisateur ne peut pas supprimer son propre compte.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function deleteUser(req, res, next) {
  try {
    const email = String(req.params.email).trim().toLowerCase();

    if (email === req.session.user.email) {
      res.status(400);
      await renderList(
        req,
        res,
        "Vous ne pouvez pas supprimer votre propre compte."
      );
      return;
    }

    await User.findOneAndDelete({ email });

    res.redirect("/dashboard/users");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  showUsers,
  showUser,
  showEditForm,
  createUser,
  updateUser,
  deleteUser
};