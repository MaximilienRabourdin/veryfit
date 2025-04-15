const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fitdoors.app@gmail.com",
    pass: "qdam rjps tckk rmyj" // mot de passe d'app
  },
});

const sendDeclarationNotification = async (req, res) => {
  const { email, orderId, url } = req.body;

  if (!email || !url) {
    return res.status(400).json({ error: "Informations manquantes." });
  }

  try {
    await transporter.sendMail({
      from: "FIT DOORS <no-reply@fitdoors.com>",
      to: email,
      subject: "📄 Nouvelle déclaration CE disponible",
      html: `
        <p>Bonjour,</p>
        <p>Un nouveau document de conformité CE est disponible pour le dossier : <strong>${orderId}</strong>.</p>
        <p>
          👉 <a href="${url}" target="_blank">Télécharger la déclaration CE</a>
        </p>
        <br />
        <p>L’équipe FIT DOORS</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    
    return res.status(500).json({ error: "Erreur envoi mail." });
  }
};

module.exports = { sendDeclarationNotification };
