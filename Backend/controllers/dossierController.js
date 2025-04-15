const { db } = require("../config/firebaseAdmin");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { sendEmailToDestinataire, sendEmailToFit } = require("../utils/email");
const { getDoc, updateDoc } = require("firebase-admin/firestore");


// 🔹 Créer un dossier CE
const createDossier = async (req, res) => {
  try {
    const rawData = req.body.data;
    if (!rawData) return res.status(400).json({ error: "Données manquantes" });

    const parsed = JSON.parse(rawData);

    const destinataireType = parsed.destinataire_type || "Revendeur";
    const dossierRef = db.collection("dossiers").doc(parsed.id);
    const produitsAvecInfos = (parsed.produits || []).map((p) => ({
      ...p,
      filled: false,
      documents: {
        declarationCE: { status: "à remplir", url: "" },
        controleMontage: { status: "à remplir", url: "" },
        declarationMontage: { status: "à remplir", url: "" },
        noticeUtilisation: {
          status: "à remplir",
          url: "https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK",
        },
        controlePeriodique: { status: "à remplir", url: "" },
      },
    }));

    const dossierData = {
      ...parsed,
      produits: produitsAvecInfos,
      destinataire_type: destinataireType,
      status: "en_attente_remplissage",
      createdAt: new Date(),
    };

    await dossierRef.set(dossierData);

    if (parsed.revendeurEmail) {
      await sendEmailToDestinataire({
        to: parsed.revendeurEmail,
        dossierId: parsed.id,
        orderName: parsed.orderName,
        deliveryDate: parsed.deliveryDate,
        produits: produitsAvecInfos,
      });
    }

    return res.status(201).json({ success: true, dossierId: parsed.id });
  } catch (error) {
    console.error("❌ Erreur dans createDossier :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Générer une déclaration CE PDF pour un produit
const generateDeclarationCEForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.productId === productId);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 500]);
    const { height } = page.getSize();

    const draw = (text, x, y) => {
      page.drawText(text, { x, y, size: 12, color: rgb(0, 0, 0) });
    };

    draw("📄 Déclaration CE", 50, height - 50);
    draw(`Nom produit : ${produit.name}`, 50, height - 80);
    draw(`Numéro de série : ${produit?.porte?.NumeroSerie || "—"}`, 50, height - 100);
    draw(`Type : ${produit.typeFormulaire || "—"}`, 50, height - 120);
    draw(`Destinataire : ${dossier.revendeur || "—"}`, 50, height - 140);
    draw(`Livraison : ${dossier.deliveryDate || "—"}`, 50, height - 160);
    draw(`Dossier : ${dossier.orderName || dossierId}`, 50, height - 180);

    const pdfBytes = await pdfDoc.save();
    const fileName = `DeclarationCE-${dossierId}-${productId}.pdf`;
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    fs.writeFileSync(filePath, pdfBytes);

    const fileUrl = `http://localhost:5000/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.productId === productId
        ? {
            ...p,
            documents: {
              ...p.documents,
              declarationCE: { url: fileUrl, status: "complété" },
            },
          }
        : p
    );

    await dossierRef.update({ produits: produitsMaj });
    await db.collection("orders").doc(dossierId).update({ produits: produitsMaj });


    await db.collection("notifications").add({
      message: `📄 Déclaration CE générée pour "${produit.name}" (dossier ${dossier.orderName})`,
      type: "declarationCE_produit",
      read: false,
      createdAt: new Date(),
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("❌ Erreur génération déclaration CE produit :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Générer une déclaration de montage PDF pour un produit
const generateDeclarationMontageForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.productId === productId);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 500]);
    const { height } = page.getSize();

    const draw = (text, x, y) => {
      page.drawText(text, { x, y, size: 12, color: rgb(0, 0, 0) });
    };

    draw("📄 Déclaration de montage", 50, height - 50);
    draw(`Nom produit : ${produit.name}`, 50, height - 80);
    draw(`Numéro de série : ${produit?.porte?.NumeroSerie || "—"}`, 50, height - 100);
    draw(`Type : ${produit.typeFormulaire || "—"}`, 50, height - 120);
    draw(`Destinataire : ${dossier.revendeur || "—"}`, 50, height - 140);
    draw(`Livraison : ${dossier.deliveryDate || "—"}`, 50, height - 160);
    draw(`Dossier : ${dossier.orderName || dossierId}`, 50, height - 180);

    const pdfBytes = await pdfDoc.save();
    const fileName = `DeclarationMontage-${dossierId}-${productId}.pdf`;
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    fs.writeFileSync(filePath, pdfBytes);

    const fileUrl = `http://localhost:5000/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.productId === productId
        ? {
            ...p,
            documents: {
              ...p.documents,
              declarationMontage: { url: fileUrl, status: "complété" },
            },
          }
        : p
    );

    await dossierRef.update({ produits: produitsMaj });
    await db.collection("orders").doc(dossierId).update({ produits: produitsMaj });


    await db.collection("notifications").add({
      message: `📄 Déclaration de montage générée pour "${produit.name}" (dossier ${dossier.orderName})`,
      type: "declarationMontage_produit",
      read: false,
      createdAt: new Date(),
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("❌ Erreur génération déclaration de montage :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Mise à jour du statut d’un document
const updateDocumentStatus = async (req, res) => {
  try {
    const { dossierId, productId, documentKey, url, status } = req.body;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produitsMaj = dossier.produits.map((p) => {
      if (p.productId === productId) {
        return {
          ...p,
          documents: {
            ...p.documents,
            [documentKey]: { url, status },
          },
        };
      }
      return p;
    });

    await dossierRef.update({ produits: produitsMaj });

    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Erreur updateDocumentStatus :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

const sendNotificationToFit = async ({ type, dossierId, produitId, message }) => {
  try {
    await db.collection("notifications").add({
      type,
      dossierId,
      produitId,
      message,
      read: false,
      createdAt: new Date(),
    });

    // ✅ Envoi d’email à FIT
    await sendEmailToFit({
      subject: `[FIT DOORS] Nouvelle déclaration reçue`,
      html: `<p>${message}</p><p>Dossier : ${dossierId}</p><p>Produit : ${produitId}</p>`,
    });

    console.log("🔔 Notification + Email envoyé à FIT :", message);
  } catch (error) {
    console.error("❌ Erreur notification/email FIT :", error);
  }
};

module.exports = {
  createDossier,
  updateDocumentStatus,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  sendNotificationToFit
};
