/**
 * Autorise la requête uniquement si un utilisateur est connecté.
 * Navigateur : redirection vers l'accueil. API : erreur 401 en JSON.
 *
 * @param {import("express").Request} req Requête HTTP.
 * @param {import("express").Response} res Réponse HTTP.
 * @param {import("express").NextFunction} next Passe à la suite.
 * @returns {void}
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    next();
    return;
  }

  if (req.accepts(["json", "html"]) === "html") {
    res.redirect("/");
    return;
  }

  res.status(401).json({ message: "Authentification requise." });
}

module.exports = { requireAuth };