const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "fitdoors.app@gmail.com", // Adresse e-mail
    pass: "zgke piyr lmsr psuy",    // Mot de passe d'application
  },
});

const sendOrderNotificationEmail = async (email, orderDetails) => {
  
  

  const { orderName, referenceNumber, affairNumber, plateNumber, deliveryDate } = orderDetails;

  const mailOptions = {
    from: "fitdoors.app@gmail.com",
    to: email,
    subject: "Nouvelle commande attribuée",
    text: `Bonjour,

Une nouvelle commande vient d'être attribuée à votre compte sur la plateforme FIT.

Détails de la commande :
- Nom du dossier : ${orderName}
- Numéro d'affaire : ${affairNumber}
- Numéro de commande : ${referenceNumber}
- Plaque d'immatriculation : ${plateNumber}
- Date de livraison : ${deliveryDate}

Veuillez vous connecter à votre plateforme pour consulter les détails et compléter les informations nécessaires.

Cordialement,
L'équipe FIT`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    
  } catch (error) {
    
    throw error;
  }
};

module.exports = { sendOrderNotificationEmail };
