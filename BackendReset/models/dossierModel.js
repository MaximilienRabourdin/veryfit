const mongoose = require("mongoose");

const dossierSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["revendeur", "carrossier"],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["en attente", "validé", "rejeté"],
    default: "en attente",
  },
  documents: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("Dossier", dossierSchema);
