const admin = require("firebase-admin");
const db = admin.firestore();
const { PDFDocument, rgb } = require("pdf-lib");
const { getStorage } = require("firebase-admin/storage");
const multer = require("multer");
const { uploadToDrive } = require("../config/googleDrive");


const storage = getStorage().bucket("fitdoorswebapp-79538.appspot.com");
const upload = multer({ storage: multer.memoryStorage() });



// 🔹 Récupérer les documents par rôle
exports.getDocumentsByRole = async (req, res) => {
    const { role } = req.params;
    

    try {
        const snapshot = await db.collection("documents").where("roles", "array-contains", role).get();
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        
        res.status(200).json({ success: true, documents });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// 🔹 Signature et upload du PDF vers Google Drive
exports.signAndUploadPDF = async (req, res) => {
    

    try {
        if (!req.file) {
            
            return res.status(400).json({ success: false, message: "Aucun fichier reçu." });
        }

        const { userId, signatureText } = req.body;
        if (!userId || !signatureText) {
            
            return res.status(400).json({ success: false, message: "Données de signature manquantes." });
        }

        
        

        // 🔹 Vérification du format PDF
        if (req.file.mimetype !== "application/pdf") {
            
            return res.status(400).json({ success: false, message: "Le fichier doit être un PDF." });
        }

        // 🔹 Charger le PDF correctement
        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(req.file.buffer);
        } catch (err) {
            
            return res.status(400).json({ success: false, message: "Fichier PDF invalide." });
        }

        const pages = pdfDoc.getPages();
        if (pages.length === 0) {
            
            return res.status(400).json({ success: false, message: "Le fichier PDF est vide." });
        }

        const firstPage = pages[0];

        // 🔹 Ajouter la signature
        firstPage.drawText(signatureText, {
            x: 50,
            y: 50,
            size: 12,
            color: rgb(1, 0, 0),
        });

        const signedPdfBytes = await pdfDoc.save();
        const fileName = `signed_${Date.now()}.pdf`;

        // 🔹 Upload vers Google Drive
        const fileUrl = await uploadToDrive(Buffer.from(signedPdfBytes), fileName);

        

        // 🔹 Enregistrer dans Firestore
        await db.collection("signedDocuments").add({
            userId,
            fileUrl,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({ success: true, fileUrl });

    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};


// 🔹 Ajouter un document
exports.addDocument = async (req, res) => {
    const { name, link, roles, category } = req.body;
    

    if (!name || !link || !roles || !category) {
        
        return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
    }

    try {
        await db.collection("documents").add({
            name,
            link,
            roles,
            category,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        res.status(201).json({ success: true, message: "Document ajouté avec succès." });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur.", error });
    }
};

// 🔹 Supprimer un document
exports.deleteDocument = async (req, res) => {
    const { id } = req.params;
    

    try {
        await db.collection("documents").doc(id).delete();
        
        res.status(200).json({ success: true, message: "Document supprimé avec succès." });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur.", error });
    }
};

// 🔹 Récupérer les documents par catégorie
exports.getDocumentsByCategory = async (req, res) => {
    const { category } = req.params;
    

    try {
        const snapshot = await db
            .collection("documents")
            .where("category", "==", category)
            .get();
        const documents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        res.status(200).json({ success: true, documents });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur.", error });
    }
};

// 🔹 Mettre à jour un document
exports.updateDocument = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    

    try {
        const docRef = db.collection("documents").doc(id);
        await docRef.update(updates);
        
        res.status(200).json({ success: true, message: "Document mis à jour avec succès." });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Erreur serveur.", error });
    }
};
