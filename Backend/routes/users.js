const express = require("express");
const { createUserWithRole } = require("../services/userService");
const router = express.Router();

router.post("/create", async (req, res) => {
  const { email, password, displayName, role } = req.body;

  try {
    const result = await createUserWithRole({ email, password, displayName, role });
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Erreur création utilisateur avec rôle :", error);
    res.status(500).json({ error: "Erreur création utilisateur" });
  }
});

module.exports = router;
