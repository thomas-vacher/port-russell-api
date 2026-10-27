const mongoose = require("mongoose");

/**
 * Définit les informations autorisées pour un catway.
 */
const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, "Le numéro du catway est obligatoire."],
      unique: true,
      min: [1, "Le numéro du catway doit être positif."]
    },
    catwayType: {
      type: String,
      required: [true, "Le type du catway est obligatoire."],
      enum: {
        values: ["long", "short"],
        message: "Le type doit être « long » ou « short »."
      },
      trim: true
    },
    catwayState: {
      type: String,
      required: [true, "L'état du catway est obligatoire."],
      trim: true,
      maxlength: [500, "L'état ne peut pas dépasser 500 caractères."]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/**
 * Représente un catway dans MongoDB.
 *
 * @type {import("mongoose").Model}
 */
module.exports = mongoose.model("Catway", catwaySchema);