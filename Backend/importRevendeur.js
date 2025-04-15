const admin = require("firebase-admin");
const revendeurs = require("../data/revendeur.json"); // Chemin correct vers le fichier JSON

// Initialisation de Firebase Admin
const serviceAccount = require("./config/firebase-service-key.json"); // Chemin correct vers la clé privée Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const importRevendeurs = async () => {
  try {
    const batch = db.batch();
    const revendeursCollection = db.collection("revendeurs");

    revendeurs.forEach((revendeur, index) => {
      // Nettoie les clés et standardise les noms
      const cleanedRevendeur = {
        codeAdherent: revendeur.N_adherent || "",
        codeVendeur: revendeur.Code_vendeur || "",
        nom: revendeur.Nom || "",
        paysRegion: revendeur.Code_pays_region || "",
        groupeCompta: revendeur.Groupe_compta || "",
        codePostal: revendeur.Code_postal || "",
        telephone: revendeur.Telephone || "",
        contact: revendeur.Contact || "Inconnu", // Valeur par défaut si vide
      };

      // Vérification des données critiques pour l'ID unique
      const uniqueId = cleanedRevendeur.nom
        ? cleanedRevendeur.nom.replace(/\s+/g, "_").toLowerCase()
        : `revendeur_${index}`;

      const docRef = revendeursCollection.doc(uniqueId);

      // Ajoute les données nettoyées au batch
      batch.set(docRef, cleanedRevendeur);
    });

    await batch.commit();
  } catch (error) {
  }
};

importRevendeurs();
