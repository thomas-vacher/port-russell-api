const mongoose = require("mongoose");

/**
 * Établit la connexion entre l'application et MongoDB.
 *
 * @returns {Promise<void>}
 */
async function connectDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connexion à MongoDB réussie.");
  } catch (error) {
    console.error("Impossible de se connecter à MongoDB.", error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;