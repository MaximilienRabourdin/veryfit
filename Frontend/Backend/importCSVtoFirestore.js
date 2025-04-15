const fs = require("fs");
const csv = require("csv-parser");
const db = require("./config/db"); // Importez l'instance de Firestore

// Fonction pour importer un fichier CSV dans Firestore
const importCSVtoFirestore = (filePath, collectionName) => {
  const batch = db.batch(); // Créez un batch pour optimiser l'import
  const collectionRef = db.collection(collectionName); // Référence à la collection

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      const docRef = collectionRef.doc(); // Génère un ID automatique pour chaque document
      batch.set(docRef, row); // Ajoute les données au batch
    })
    .on("end", async () => {
      try {
        await batch.commit(); // Validez toutes les opérations
      } catch (error) {
      }
    });
};

// Appels pour importer les fichiers CSV
importCSVtoFirestore("./Clients.csv", "clients"); // Collection "clients"
importCSVtoFirestore("./Gamme_machine.csv", "products"); // Collection "products"
