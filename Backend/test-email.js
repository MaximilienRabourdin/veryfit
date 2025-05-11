require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true si port 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Test VERYFIT" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // envoi à toi-même pour test
      subject: "✅ Test envoi d’email depuis Render",
      html: `<p>Bonjour,</p><p>Ceci est un test depuis <strong>Render + Nodemailer</strong>.</p><p>Tout fonctionne bien ✅</p>`,
    });

    console.log("📧 Email envoyé avec succès :", info.messageId);
  } catch (error) {
    console.error("❌ Erreur lors de l’envoi de l’email :", error);
  }
})();
