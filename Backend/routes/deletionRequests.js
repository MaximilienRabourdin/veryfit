const express = require("express");
const {
  createDeletionRequest,
  getDeletionRequests,
  updateDeletionRequest,
} = require("../controllers/deletionRequestController");

const router = express.Router();

// Créer une demande de suppression
router.post("/", createDeletionRequest);

// Récupérer toutes les demandes
router.get("/", getDeletionRequests);

// Mettre à jour une demande
router.put("/:id", updateDeletionRequest);

module.exports = router;
