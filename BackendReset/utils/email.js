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

const sendEmailToDestinataire = async ({
  to,
  dossierId,
  orderName,
  deliveryDate,
  produits = [],
  fichiers = {},
  isRappelControle = false,
}) => {
  try {
    // === Cas normal : nouveau dossier CE ===
    let subject = `[VERYFIT] Nouveau dossier CE à compléter - ${orderName}`;
    let htmlContent = `
      <p>Bonjour,</p>
      <p>Vous avez un nouveau <strong>dossier CE</strong> à compléter :</p>
      <ul>
        <li><strong>Numéro du dossier :</strong> ${orderName}</li>
        <li><strong>Date de livraison prévue :</strong> ${deliveryDate}</li>
      </ul>

      <p><strong>Produits concernés :</strong></p>
      <p>${produits.map((prod) => `• ${prod.name} (x${prod.quantity || 1})`).join("<br>")}</p>

      ${
        fichiers && Object.keys(fichiers).length
          ? `<p><strong>Fichiers joints :</strong><br>${Object.values(fichiers)
              .map((f) => `• ${f.name}`)
              .join("<br>")}</p>`
          : ""
      }

      <p>Merci de vous connecter à votre espace pour compléter les formulaires :</p>
      <p><a href="https://veryfit.fr/login" target="_blank">Se connecter à la plateforme</a></p>

      <p>Bonne journée,</p>
      <p>L'équipe FIT Doors</p>
    `;

    // === Cas spécial : rappel de contrôle périodique ===
    if (isRappelControle) {
      subject = `📆 Rappel – Contrôle périodique à effectuer (dossier ${orderName})`;
      htmlContent = `
        <p>Bonjour,</p>
        <p>Ceci est un rappel automatique : le <strong>contrôle périodique</strong> de la porte installée pour le dossier <strong>${orderName}</strong> est à effectuer aujourd’hui.</p>

        <p>Merci de vous connecter à la plateforme VERIFIT pour le compléter :</p>
        <p><a href="https://veryfit.fr/revendeur/dashboard" target="_blank">Accéder à votre espace</a></p>

        <p>L'équipe FIT Doors</p>
      `;
    }

    const attachments = Object.values(fichiers).map((file) => ({
      filename: file.name,
      content: file.buffer,
      contentType: file.mimetype,
    }));

    await transporter.sendMail({
      from: `"VERYFIT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      attachments,
    });

    console.log(`📧 Email ${isRappelControle ? "de rappel " : ""}envoyé à ${to}`);
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
