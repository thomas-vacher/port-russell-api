const mongoose = require("mongoose");

/**
 * Définit les informations autorisées pour une réservation.
 */
const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, "Le numéro du catway est obligatoire."],
      min: [1, "Le numéro du catway doit être positif."]
    },
    clientName: {
      type: String,
      required: [true, "Le nom du client est obligatoire."],
      trim: true,
      maxlength: [100, "Le nom du client ne peut pas dépasser 100 caractères."]
    },
    boatName: {
      type: String,
      required: [true, "Le nom du bateau est obligatoire."],
      trim: true,
      maxlength: [100, "Le nom du bateau ne peut pas dépasser 100 caractères."]
    },
    startDate: {
      type: Date,
      required: [true, "La date de début est obligatoire."]
    },
    endDate: {
      type: Date,
      required: [true, "La date de fin est obligatoire."],
      validate: {
        validator(endDate) {
          return !this.startDate || endDate > this.startDate;
        },
        message: "La date de fin doit être postérieure à la date de début."
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Représente une réservation dans MongoDB.
 *
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("Reservation", reservationSchema);