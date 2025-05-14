const express = require("express");
const router = express.Router();

// Route pour récupérer les statistiques
router.get("/", (req, res) => {
    const stats = {
        toValidate: 5,
        rejected: 8,
        toDeclare: 30,
    };
    res.json(stats);
});

module.exports = router;
