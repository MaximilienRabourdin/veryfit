const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// 🔹 Authentification de base
router.post("/create-account", authController.createAccount);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

// 🔹 Gestion des utilisateurs
router.get("/get-unapproved-users", authController.getUnapprovedUsers);
router.get("/get-approved-users", authController.getApprovedUsers);
router.post("/validate-account", authController.validateAccount);
router.delete("/delete-account/:uid", authController.deleteAccount);
router.get("/users/:role", authController.getUsersByRole);


module.exports = router;
