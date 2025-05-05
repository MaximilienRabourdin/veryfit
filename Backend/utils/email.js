const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailToDestinataire = async ({ to, dossierId, orderName, deliveryDate, produits, fichiers }) => {
  try {
    const produitList = produits
      .map((prod) => `• ${prod.name} (x${prod.quantity})`)
      .join("<br>");

    let attachments = [];
    let fichierListHTML = "";

    if (fichiers && typeof fichiers === "object") {
      Object.entries(fichiers).forEach(([key, file]) => {
        attachments.push({
          filename: file.name,
          content: file.buffer,
          contentType: file.mimetype,
        });

        fichierListHTML += `• ${file.name}<br>`;
      });
    }

    await transporter.sendMail({
      from: `"VERYFIT" <${process.env.EMAIL_USER}>`,
      to,
      subject: `[VERYFIT] Nouveau dossier CE à compléter - ${orderName}`,
      html: `
        <p>Bonjour,</p>
        <p>Vous avez un nouveau dossier CE à compléter :</p>
        <ul>
          <li><strong>Numéro du dossier :</strong> ${orderName}</li>
          <li><strong>Date de livraison prévue :</strong> ${deliveryDate}</li>
        </ul>

        <p><strong>Produits concernés :</strong></p>
        <p>${produitList}</p>

        ${fichierListHTML
          ? `<p><strong>Fichiers joints :</strong><br>${fichierListHTML}</p>`
          : ""}

        <p>Merci de vous connecter à votre espace pour compléter le formulaire :</p>
        <p><a href="https://veryfit.vercel.app/login" target="_blank">Se connecter à la plateforme</a></p>

        <p>Bonne journée,</p>
        <p>L'équipe FIT Doors</p>
      `,
      attachments,
    });

    console.log(`📧 Email envoyé à ${to} avec ${attachments.length} pièce(s) jointe(s)`);
  } catch (error) {
    console.error("Erreur envoi email destinataire :", error);
  }
};


const sendEmailToFit = async ({ subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"FIT Doors" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject,
      html,
    });

    console.log(`📧 Notification email envoyée à FIT`);
  } catch (error) {
    console.error("Erreur envoi email FIT :", error);
  }
};

module.exports = {
  sendEmailToDestinataire,
  sendEmailToFit,
};
