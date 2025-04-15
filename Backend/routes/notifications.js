const express = require("express");
const router = express.Router();
const { sendOrderNotificationEmail } = require("../utils/FitNotifications");
const { sendDeclarationNotification } = require("../controllers/notificationController");

router.post("/sendNotification", async (req, res) => {
  const { email, orderDetails } = req.body;

  try {
    await sendOrderNotificationEmail(email, orderDetails);
    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email", error });
  }
});

router.post("/send-declaration-notification", sendDeclarationNotification);


module.exports = router;
