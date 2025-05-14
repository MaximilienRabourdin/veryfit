const express = require("express");
const { addDocument } = require("../controllers/testController");

const router = express.Router();

// Route pour ajouter un document
router.post("/add-document", addDocument);

module.exports = router;
