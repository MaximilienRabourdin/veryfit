const { db } = require("../config/firebaseAdmin");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
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
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Générer une déclaration CE PDF pour un produit
const generateDeclarationCEForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists())
      return res.status(404).json({ error: "Dossier introuvable" });

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
    draw(
      `Numéro de série : ${produit?.porte?.NumeroSerie || "—"}`,
      50,
      height - 100
    );
    draw(`Type : ${produit.typeFormulaire || "—"}`, 50, height - 120);
    draw(`Destinataire : ${dossier.revendeur || "—"}`, 50, height - 140);
    draw(`Livraison : ${dossier.deliveryDate || "—"}`, 50, height - 160);
    draw(`Dossier : ${dossier.orderName || dossierId}`, 50, height - 180);

    const pdfBytes = await pdfDoc.save();
    const fileName = `DeclarationCE-${dossierId}-${productId}.pdf`;
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    fs.writeFileSync(filePath, pdfBytes);

    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;

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
    await db
      .collection("orders")
      .doc(dossierId)
      .update({ produits: produitsMaj });

    await db.collection("notifications").add({
      message: `📄 Déclaration CE générée pour "${produit.name}" (dossier ${dossier.orderName})`,
      type: "declarationCE_produit",
      read: false,
      createdAt: new Date(),
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Générer une déclaration de montage PDF pour un produit
const generateDeclarationMontageForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists)
      return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.productId === productId);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawText = (text, x, y, size = 12) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // 🔹 Logo VERIFIT
    const logoPath = path.join(__dirname, "../../assets/verifit_logo.png");
    const logoImageBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    page.drawImage(logoImage, {
      x: width - 160,
      y: height - 70,
      width: 120,
      height: 40,
    });

    // 🔹 Titre
    drawText("Déclaration de montage", 50, height - 50, 16);
    drawText("À remplir par l'installateur de la porte FIT et de ses options.", 50, height - 70, 10);

    // 🔹 Bloc infos
    let y = height - 110;
    drawText("Nom de l'entreprise / Nom et fonction du responsable :", 50, y);
    y -= 20;
    drawText(`Dossier : ${dossier.orderName || dossierId}`, 50, y);
    y -= 20;
    drawText(`Nom du produit : ${produit.name || "—"}`, 50, y);
    y -= 20;
    drawText(`Numéro de série de la porte : ${produit?.porte?.NumeroSerie || "—"}`, 50, y);
    y -= 20;
    drawText(`N° immatriculation : ${produit.immatriculation || "—"}`, 50, y);
    y -= 20;
    drawText(`N° de série carrosserie : ${produit.numeroSerieCarrosserie || "—"}`, 50, y);
    y -= 20;
    drawText(`Marque caisse : ${produit.marqueCaisse || "—"}`, 50, y);
    y -= 20;
    drawText(`N° de hayon : ${produit.numeroHayon || "—"}`, 50, y);

    y -= 40;
    drawText("Date :", 50, y);
    drawText(new Date().toISOString().slice(0, 10), 100, y);
    drawText("Signature du responsable :", 300, y);

    const pdfBytes = await pdfDoc.save();
    const fileName = `DeclarationMontage-${dossierId}-${productId}.pdf`;
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    fs.writeFileSync(filePath, pdfBytes);

    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;

    // 🔄 Mise à jour Firestore
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
    console.error("Erreur déclaration montage:", error.message);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Mise à jour du statut d’un document
const updateDocumentStatus = async (req, res) => {
  try {
    const { dossierId, productId, documentKey, url, status } = req.body;

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists())
      return res.status(404).json({ error: "Dossier introuvable" });

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
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

const sendNotificationToFit = async ({
  type,
  dossierId,
  produitId,
  message,
}) => {
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
  } catch (error) {}
};

module.exports = {
  createDossier,
  updateDocumentStatus,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  sendNotificationToFit,
};
