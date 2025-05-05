const express = require("express");
const router = express.Router();
const { sendOrderNotificationEmail } = require("../utils/FitNotifications");
const { sendNotification } = require("../controllers/notificationsController");

router.post("/sendNotification", async (req, res) => {
  const { email, orderDetails } = req.body;

  try {
    await sendOrderNotificationEmail(email, orderDetails);
    res.status(200).json({ message: "Email envoyé avec succès" });
  } catch (error) {
    
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email", error });
  }
});

router.post("/send", sendNotification);


module.exports = router;
