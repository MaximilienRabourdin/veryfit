const express = require("express");
const { createLog, getLogs } = require("../controllers/logController");

const router = express.Router();

// Route POST pour ajouter un log
router.post("/", createLog);

// Route GET pour récupérer tous les logs
router.get("/", getLogs);

module.exports = router;
