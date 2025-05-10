const { db } = require("../config/firebaseAdmin");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { sendEmailToDestinataire, sendEmailToFit } = require("../utils/email");
const { generateCarrossierDeclarationPDF } = require("../utils/generateCarrossierDeclarationPDF");



const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

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
      documentsChoisis: p.documentsChoisis || {
        declarationCE: true,
        declarationMontage: true,
        controlePeriodique: true,
        noticeUtilisation: true,
      },
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

    const creationDate = new Date();
    const controlePeriodiqueDate = new Date(creationDate);
    controlePeriodiqueDate.setMonth(controlePeriodiqueDate.getMonth() + 6);
    
    const dossierData = {
      ...parsed,
      produits: produitsAvecInfos,
      destinataire_type: destinataireType,
      status: "en_attente_remplissage",
      createdAt: creationDate,
      controlePeriodiqueDate, // 🔹 Date de rappel stockée ici
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
    console.error("🚨 Erreur serveur createDossier :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Déclaration CE
const generateDeclarationCEForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.uuid === productId);
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
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));
    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.uuid === productId
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
    await db.collection("orders").doc(dossierId).update({ produits: produitsMaj }).catch(() => {});

    await sendNotificationToFit({
      type: "declarationCE_produit",
      dossierId,
      produitId,
      message: `📄 Déclaration CE générée pour le produit "${produit.name}" dans le dossier "${dossier.orderName}".`,
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Déclaration Montage
const generateDeclarationMontageForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    console.log("Génération déclaration de montage pour dossier =", dossierId, "et produit =", productId);

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find(
      (p) => p.uuid === productId || p.productId === productId
    );    if (!produit || !produit.declarationMontageData) {
      return res.status(404).json({ error: "Déclaration de montage non trouvée." });
    }

    const data = produit.declarationMontageData;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    const drawText = (text, x, y, size = 11) => {
      page.drawText(text || "—", {
        x,
        y,
        size,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    };

    let y = height - 50;
    drawText("🧾 Déclaration de montage", 50, y, 16); y -= 30;
    drawText("A remplir par l'installateur de la porte FIT et de ses options.", 50, y); y -= 40;
    drawText("Nom du carrossier :", 50, y);
    drawText(data.nomCarrossier, 250, y); y -= 25;
    drawText("Numéro de série :", 50, y);
    drawText(data.numeroSerie, 250, y); y -= 25;
    drawText("Date du montage :", 50, y);
    drawText(data.dateMontage, 250, y); y -= 25;
    drawText("Observations :", 50, y); y -= 15;
    drawText(data.observations || "—", 70, y); y -= 50;

    drawText("Par cette déclaration, je certifie que :", 50, y); y -= 15;
    drawText("- la porte et ses options ont été montées conformément aux instructions", 60, y); y -= 15;
    drawText("- le test et le contrôle ont obtenu un résultat positif", 60, y); y -= 15;
    drawText("- la porte et ses options sont aptes à l’usage prévu", 60, y); y -= 30;

    drawText("Date :", 50, y);
    drawText(data.dateMontage, 100, y);
    drawText("Signature :", 300, y); y -= 100;

    if (data.signature) {
      const signatureImageBytes = Buffer.from(data.signature.split(",")[1], "base64");
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const dims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, { x: 300, y, width: dims.width, height: dims.height });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `DeclarationMontage-${dossierId}-${productId}.pdf`;
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));
    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.uuid === productId
        ? {
            ...p,
            filled: true,
            status: "rempli",
            documents: {
              ...p.documents,
              declarationMontage: { url: fileUrl, status: "complété" },
            },
          }
        : p
    );

    await dossierRef.update({ produits: produitsMaj });

    await sendNotificationToFit({
      type: "declarationMontage_produit",
      dossierId,
      produitId,
      message: `🧾 Déclaration de montage reçue pour le produit "${produit.name}" dans le dossier "${dossier.orderName}".`,
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("❌ Erreur génération déclaration de montage :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};


// 🔹 Mise à jour d’un document
const updateDocumentStatus = async (req, res) => {
  try {
    const { dossierId, productId, documentKey, url, status } = req.body;
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await getDoc(dossierRef);
    if (!snapshot.exists()) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produitsMaj = dossier.produits.map((p) => {
      if (p.uuid === productId) {
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

// 🔹 Notification à FIT
const sendNotificationToFit = async ({ type, dossierId, produitId, message }) => {
  try {
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snap = await dossierRef.get();
    if (!snap.exists) throw new Error("Dossier introuvable");

    const dossier = snap.data();
    const orderName = dossier.orderName || dossierId;
    const destinataire = dossier.revendeurEmail || dossier.nomDestinataire || "Destinataire inconnu";

    const finalMessage = message || `🧾 Nouvelle mise à jour dans le dossier "${orderName}" (Destinataire : ${destinataire})`;

    await db.collection("notifications").add({
      type,
      dossierId,
      produitId,
      message: finalMessage,
      read: false,
      createdAt: new Date(),
    });

    await sendEmailToFit({
      subject: `[FIT DOORS] Nouvelle notification - ${orderName}`,
      html: `
        <p>${finalMessage}</p>
        <p>📂 Dossier : <strong>${orderName}</strong></p>
        <p>👤 Destinataire : <strong>${destinataire}</strong></p>
        <p><a href="https://veryfit.vercel.app/fit/orders/${dossierId}" target="_blank">📄 Voir le dossier</a></p>
      `,
    });

    console.log("✅ Notification enregistrée et email envoyé à FIT.");
  } catch (error) {
    console.error("❌ Erreur lors de sendNotificationToFit :", error.message);
  }
};

const generateDeclarationMontageCarrossier = async (req, res) => {
  try {
    const { dossierId } = req.params;
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const data = dossier.declarationMontageData;
    if (!data) return res.status(404).json({ error: "Données de déclaration de montage non trouvées" });

    const fileUrl = await generateCarrossierDeclarationPDF(dossierId, data);

    await dossierRef.update({ declarationMontageCarrossierPdf: fileUrl });

    await db.collection("notifications").add({
      type: "declarationMontageCarrossier",
      dossierId,
      message: `🧾 Déclaration de montage carrossier enregistrée pour le dossier (${data.numeroSerie} - ${data.nomCarrossier})`,
      read: false,
      createdAt: new Date(),
    });

    await sendEmailToFit({
      subject: `[FIT DOORS] Nouvelle déclaration de montage reçue`,
      html: `
        <p>Bonjour,</p>
        <p>Une <strong>déclaration de montage carrossier</strong> a été enregistrée sur la plateforme VERIFIT pour le dossier suivant :</p>
        <ul>
          <li><strong>Nom du carrossier :</strong> ${data.nomCarrossier}</li>
          <li><strong>Numéro de série :</strong> ${data.numeroSerie}</li>
          <li><strong>Date de montage :</strong> ${data.dateMontage}</li>
        </ul>
        <p>➡️ <a href="https://veryfit.vercel.app/fit/orders/${dossierId}" target="_blank">Consulter le dossier</a></p>
        <p>Merci de vous connecter à votre espace FIT pour vérifier les documents.</p>
        <p>Cordialement,<br>L'équipe VERIFIT</p>
      `,
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Erreur génération déclaration de montage carrossier :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};



module.exports = {
  createDossier,
  updateDocumentStatus,
  generateDeclarationCEForProduct,
  generateDeclarationMontageForProduct,
  generateDeclarationMontageCarrossier, 
  sendNotificationToFit,
};



