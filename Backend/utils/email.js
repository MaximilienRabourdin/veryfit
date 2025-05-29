const nodemailer = require("nodemailer");

// Vérification des variables d'environnement au démarrage
const checkEmailConfig = () => {
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes pour l'email: ${missing.join(', ')}`);
    console.error("📧 L'envoi d'emails sera désactivé");
    return false;
  }
  
  console.log("✅ Configuration email OK");
  return true;
};

const emailConfigValid = checkEmailConfig();

let transporter = null;

if (emailConfigValid) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Ajout de timeouts pour éviter les blocages
      connectionTimeout: 10000, // 10 secondes
      socketTimeout: 10000,
    });
    
    console.log("✅ Transporter email créé");
  } catch (error) {
    console.error("❌ Erreur création transporter:", error);
  }
}

const sendEmailToDestinataire = async ({
  to,
  dossierId,
  orderName,
  deliveryDate,
  produits = [],
  fichiers = {},
  isRappelControle = false,
}) => {
  // Si pas de configuration email valide, on ignore silencieusement
  if (!emailConfigValid || !transporter) {
    console.log("⚠️ Email désactivé (configuration manquante)");
    return { success: false, reason: "Configuration email manquante" };
  }

  // Validation des paramètres essentiels
  if (!to || !orderName) {
    console.error("❌ Paramètres email manquants:", { to, orderName });
    return { success: false, reason: "Paramètres manquants" };
  }

  try {
    console.log(`📧 Préparation email pour: ${to}`);

    // === Cas normal : nouveau dossier CE ===
    let subject = `[VERYFIT] Nouveau dossier CE à compléter - ${orderName}`;
    let htmlContent = `
      <p>Bonjour,</p>
      <p>Vous avez un nouveau <strong>dossier CE</strong> à compléter :</p>
      <ul>
        <li><strong>Numéro du dossier :</strong> ${orderName}</li>
        <li><strong>Date de livraison prévue :</strong> ${deliveryDate || 'Non spécifiée'}</li>
      </ul>

      <p><strong>Produits concernés :</strong></p>
      <p>${produits.map((prod) => `• ${prod.name || 'Produit'} (x${prod.quantity || 1})`).join("<br>")}</p>

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
        <p>Ceci est un rappel automatique : le <strong>contrôle périodique</strong> de la porte installée pour le dossier <strong>${orderName}</strong> est à effectuer aujourd'hui.</p>

        <p>Merci de vous connecter à la plateforme VERIFIT pour le compléter :</p>
        <p><a href="https://veryfit.fr/revendeur/dashboard" target="_blank">Accéder à votre espace</a></p>

        <p>L'équipe FIT Doors</p>
      `;
    }

    // Préparation des pièces jointes avec protection
    const attachments = [];
    if (fichiers && typeof fichiers === 'object') {
      Object.values(fichiers).forEach(file => {
        if (file && file.buffer && file.name) {
          attachments.push({
            filename: file.name,
            content: file.buffer,
            contentType: file.mimetype || 'application/octet-stream',
          });
        }
      });
    }

    console.log(`📎 ${attachments.length} pièce(s) jointe(s) préparée(s)`);

    // Envoi avec timeout
    const mailOptions = {
      from: `"VERYFIT" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
      attachments,
    };

    console.log("📤 Envoi email en cours...");
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email ${isRappelControle ? "de rappel " : ""}envoyé à ${to}`);
    console.log("📋 Message ID:", result.messageId);
    
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error("❌ Erreur envoi email destinataire:", error);
    console.error("📧 Email destinataire:", to);
    
    // Ne pas faire échouer toute l'opération pour un problème d'email
    return { success: false, error: error.message };
  }
};

const sendEmailToFit = async ({ subject, html }) => {
  if (!emailConfigValid || !transporter) {
    console.log("⚠️ Email FIT désactivé (configuration manquante)");
    return { success: false, reason: "Configuration email manquante" };
  }

  try {
    const result = await transporter.sendMail({
      from: `"FIT Doors" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject,
      html,
    });

    console.log(`✅ Notification email envoyée à FIT`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error("❌ Erreur envoi email FIT:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmailToDestinataire,
  sendEmailToFit,
};