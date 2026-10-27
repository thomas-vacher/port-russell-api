require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const connectDatabase = require("../config/database");
const Catway = require("../models/Catway");
const Reservation = require("../models/Reservation");

/**
 * Lit et transforme un fichier JSON en données JavaScript.
 *
 * @param {string} fileName Nom du fichier à lire.
 * @returns {Array<object>} Données contenues dans le fichier.
 */
function readJsonFile(fileName) {
  const filePath = path.join(__dirname, "../data/Fichiers", fileName);
  const content = fs.readFileSync(filePath, "utf8");

  return JSON.parse(content);
}

/**
 * Importe les catways et réservations fournis dans MongoDB.
 *
 * @returns {Promise<void>}
 */
async function importData() {
  try {
    await connectDatabase();

    const catwayCount = await Catway.countDocuments();
    const reservationCount = await Reservation.countDocuments();

    if (catwayCount > 0 || reservationCount > 0) {
      console.log("Import annulé : la base contient déjà des données.");
      return;
    }

    const catways = readJsonFile("catways.json");
    const reservations = readJsonFile("reservations.json");

    await Catway.insertMany(catways);
    await Reservation.insertMany(reservations);

    console.log("Catways et réservations importés avec succès.");
  } catch (error) {
    console.error("Erreur pendant l'importation :", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

importData();