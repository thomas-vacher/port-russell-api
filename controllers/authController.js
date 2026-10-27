const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * Connecte un utilisateur à partir de son e-mail et de son mot de passe.
 * Formulaire HTML : redirection vers le tableau de bord.
 * Requête JSON : réponse JSON.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {Promise<void>}
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const wantsJson = Boolean(req.is("json"));
    const errorMessage = "Email ou mot de passe incorrect.";

    const fail = () => {
      if (wantsJson) {
        return res.status(401).json({ message: errorMessage });
      }

      return res.status(401).render("home", {
        title: "Port de plaisance Russell",
        error: errorMessage
      });
    };

    if (typeof email !== "string" || typeof password !== "string") {
      fail();
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !await bcrypt.compare(password, user.password)) {
      fail();
      return;
    }

    req.session.user = {
      username: user.username,
      email: user.email
    };

    if (wantsJson) {
      res.status(200).json({ message: "Connexion réussie." });
      return;
    }

    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
}

/**
 * Déconnecte l'utilisateur puis le renvoie vers l'accueil.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Gestionnaire d'erreur.
 * @returns {void}
 */
function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}

module.exports = {
  login,
  logout
};