const nodemailer = require('nodemailer');
require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmailToDestinataire = async ({ to, dossierId, orderName, deliveryDate, produits }) => {
  const dashboardUrl = `http://localhost:3000/`; // ou directement l'URL du dashboard revendeur

  const produitsHTML = produits && produits.length > 0
    ? `<ul>${produits.map(p => `<li>${p.name} — Quantité : ${p.quantity}</li>`).join("")}</ul>`
    : "<p>Aucun produit renseigné.</p>";

  await transporter.sendMail({
    from: "no-reply@fitdoors.com",
    to,
    subject: `📄 Nouveau dossier CE à compléter - ${orderName}`,
    html: `
      <h2>Bonjour,</h2>
      <p>Vous avez reçu un nouveau dossier CE à compléter.</p>
      <ul>
        <li><strong>Nom du dossier :</strong> ${orderName}</li>
        <li><strong>Date de livraison :</strong> ${deliveryDate}</li>
      </ul>

      <h3>📦 Produits concernés :</h3>
      ${produitsHTML}

      <p>
        👉 <a href="${dashboardUrl}">Cliquez ici pour accéder à votre espace personnel</a>
      </p>

      <p>Une fois connecté, vous pourrez remplir le formulaire lié à ce dossier, le signer et l’envoyer automatiquement à FIT.</p>

      <br />
      <p>L’équipe FIT DOORS</p>
    `
  });
};

const sendEmailToFit = async ({ subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"FIT DOORS" <${process.env.GMAIL_USER}>`,
      to: "fitdoors.app@gmail.com",
      subject,
      html,
    });
    
  } catch (error) {
    
  }
};


module.exports = { sendEmailToDestinataire, sendEmailToFit };
