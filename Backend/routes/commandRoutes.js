const express = require("express");
const { updateCommandStatus } = require("../controllers/commandController");

const router = express.Router();

router.put("/update-status", updateCommandStatus);

module.exports = router;