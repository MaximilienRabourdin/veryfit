const express = require("express");
const router = express.Router();
const { generateControlePeriodiquePDF } = require("../controllers/generateControlePeriodiquePDF");

router.post("/controle-periodique/:dossierId/:productId", generateControlePeriodiquePDF);

module.exports = router;