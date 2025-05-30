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

// 🔹 Calcul de la date de contrôle périodique
const calculateControlePeriodiqueDate = (createdAt) => {
  const date = new Date(createdAt);
  date.setMonth(date.getMonth() + 6);
  return date;
};

// 🔹 Vérifier si le contrôle périodique est disponible
const isControlePeriodiqueAvailable = (controlePeriodiqueDate) => {
  const now = new Date();
  return new Date(controlePeriodiqueDate) <= now;
};

// 🔹 Programmer une tâche de contrôle périodique
const scheduleControlePeriodiqueTask = async (dossierId, controlePeriodiqueDate, dossierData) => {
  try {
    await db.collection('scheduled_tasks').add({
      type: 'controle_periodique',
      dossierId: dossierId,
      scheduledDate: controlePeriodiqueDate,
      dossierName: dossierData.orderName,
      destinataireType: dossierData.destinataire_type,
      destinataireEmail: dossierData.revendeurEmail || dossierData.carrossierEmail,
      destinataireNom: dossierData.revendeur || dossierData.carrossier,
      produits: dossierData.produits.map(p => ({
        productId: p.uuid,
        name: p.name,
        numeroSerie: p.porte?.NumeroSerie
      })),
      status: 'pending',
      createdAt: new Date()
    });
    
    console.log(`✅ Tâche de contrôle périodique programmée pour le ${controlePeriodiqueDate.toLocaleDateString()}`);
  } catch (error) {
    console.error('❌ Erreur lors de la programmation du contrôle périodique:', error);
  }
};

// 🔹 Créer un dossier CE avec logique de contrôle périodique
const createDossier = async (req, res) => {
  try {
    const rawData = req.body.data;
    if (!rawData) return res.status(400).json({ error: "Données manquantes" });

    const parsed = JSON.parse(rawData);
    const destinataireType = parsed.destinataire_type || "Revendeur";
    const dossierRef = db.collection("dossiers").doc(parsed.id);

    const creationDate = new Date();
    const controlePeriodiqueDate = calculateControlePeriodiqueDate(creationDate);

    const produitsAvecInfos = (parsed.produits || []).map((p) => ({
      ...p,
      filled: false,
      controlePeriodiqueStatus: 'pending',
      controlePeriodiqueAvailableDate: controlePeriodiqueDate,
      documentsChoisis: p.documentsChoisis || {
        declarationCE: true,
        declarationMontage: true,
        controlePeriodique: true,
        noticeInstruction: true,
      },
      documents: {
        declarationCE: { status: "à remplir", url: "" },
        controleMontage: { status: "à remplir", url: "" },
        declarationMontage: { status: "à remplir", url: "" },
        noticeUtilisation: {
          status: "à remplir",
          url: "https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK",
        },
        controlePeriodique: { 
          status: "en_attente",
          url: "",
          availableDate: controlePeriodiqueDate
        },
      },
    }));
    
    const dossierData = {
      ...parsed,
      produits: produitsAvecInfos,
      destinataire_type: destinataireType,
      status: "en_attente_remplissage",
      createdAt: creationDate,
      controlePeriodiqueDate,
      controlePeriodiqueNotificationSent: false,
    };

    await dossierRef.set(dossierData);
    await scheduleControlePeriodiqueTask(parsed.id, controlePeriodiqueDate, dossierData);

    if (parsed.revendeurEmail) {
      await sendEmailToDestinataire({
        to: parsed.revendeurEmail,
        dossierId: parsed.id,
        orderName: parsed.orderName,
        deliveryDate: parsed.deliveryDate,
        produits: produitsAvecInfos,
        controlePeriodiqueDate: controlePeriodiqueDate,
      });
    }

    return res.status(201).json({ 
      success: true, 
      dossierId: parsed.id,
      controlePeriodiqueDate: controlePeriodiqueDate
    });
  } catch (error) {
    console.error("🚨 Erreur serveur createDossier :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Endpoint pour vérifier la disponibilité du contrôle périodique
const checkControlePeriodiqueAvailability = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;
    
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.uuid === productId);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });

    const isAvailable = isControlePeriodiqueAvailable(dossier.controlePeriodiqueDate);
    
    return res.json({
      available: isAvailable,
      availableDate: dossier.controlePeriodiqueDate,
      status: produit.controlePeriodiqueStatus || 'pending',
      daysRemaining: isAvailable ? 0 : Math.ceil((new Date(dossier.controlePeriodiqueDate) - new Date()) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error("❌ Erreur vérification contrôle périodique:", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// 🔹 Créer une notification de contrôle périodique
const createControlePeriodiqueNotification = async (dossierId) => {
  try {
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const dossierSnap = await dossierRef.get();
    
    if (!dossierSnap.exists) {
      console.error(`❌ Dossier ${dossierId} introuvable pour contrôle périodique`);
      return;
    }
    
    const dossier = dossierSnap.data();
    
    if (dossier.controlePeriodiqueNotificationSent) {
      console.log(`ℹ️ Notification déjà envoyée pour le dossier ${dossierId}`);
      return;
    }
    
    await db.collection("notifications").add({
      type: "controle_periodique_available",
      dossierId: dossierId,
      message: `🔔 Contrôle périodique maintenant disponible pour le dossier "${dossier.orderName}"`,
      read: false,
      createdAt: new Date(),
      targetRole: "revendeur",
      targetEmail: dossier.revendeurEmail
    });
    
    const produitsUpdated = dossier.produits.map(produit => ({
      ...produit,
      controlePeriodiqueStatus: 'available',
      documents: {
        ...produit.documents,
        controlePeriodique: {
          ...produit.documents.controlePeriodique,
          status: "à remplir"
        }
      }
    }));
    
    await dossierRef.update({ 
      produits: produitsUpdated,
      controlePeriodiqueNotificationSent: true 
    });
    
    if (dossier.revendeurEmail) {
      await sendEmailToDestinataire({
        to: dossier.revendeurEmail,
        subject: `[VERIFIT] Contrôle périodique disponible - ${dossier.orderName}`,
        html: `
          <h2>🔔 Contrôle périodique disponible</h2>
          <p>Bonjour,</p>
          <p>Le contrôle périodique est maintenant disponible pour le dossier suivant :</p>
          <ul>
            <li><strong>Dossier :</strong> ${dossier.orderName}</li>
            <li><strong>Date de création :</strong> ${dossier.createdAt.toDate().toLocaleDateString('fr-FR')}</li>
            <li><strong>Produits concernés :</strong> ${dossier.produits.length} produit(s)</li>
          </ul>
          <p>➡️ <a href="https://veryfit.vercel.app/revendeur/dashboard" target="_blank" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Accéder au contrôle périodique</a></p>
          <p>Vous pouvez maintenant remplir les formulaires de contrôle pour chaque produit.</p>
          <p>Cordialement,<br>L'équipe VERIFIT</p>
        `
      });
    }
    
    await sendEmailToFit({
      subject: `[FIT DOORS] Contrôle périodique disponible - ${dossier.orderName}`,
      html: `
        <p>Bonjour,</p>
        <p>Un <strong>contrôle périodique</strong> est maintenant disponible pour le dossier suivant :</p>
        <ul>
          <li><strong>Dossier :</strong> ${dossier.orderName}</li>
          <li><strong>Date de création :</strong> ${dossier.createdAt.toDate().toLocaleDateString('fr-FR')}</li>
          <li><strong>Revendeur :</strong> ${dossier.revendeur || dossier.revendeurEmail}</li>
          <li><strong>Produits :</strong> ${dossier.produits.length} produit(s)</li>
        </ul>
        <p>Le revendeur a été notifié par email.</p>
        <p>➡️ <a href="https://veryfit.vercel.app/fit/orders/${dossierId}" target="_blank">Consulter le dossier</a></p>
        <p>Cordialement,<br>L'équipe VERIFIT</p>
      `,
    });
    
    console.log(`✅ Notification de contrôle périodique créée et envoyée pour le dossier ${dossierId}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de notification contrôle périodique:', error);
  }
};

// 🔹 Génération contrôle périodique avec vérification
const generateControlePeriodiqueForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;
    
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find((p) => p.uuid === productId);
    if (!produit) return res.status(404).json({ error: "Produit non trouvé" });

    const isAvailable = isControlePeriodiqueAvailable(dossier.controlePeriodiqueDate);
    if (!isAvailable) {
      return res.status(403).json({ 
        error: "Contrôle périodique non disponible",
        availableDate: dossier.controlePeriodiqueDate,
        message: `Le contrôle périodique sera disponible le ${dossier.controlePeriodiqueDate.toDate().toLocaleDateString('fr-FR')}`
      });
    }

    if (!produit.controlePeriodiqueData) {
      return res.status(404).json({ error: "Données de contrôle périodique manquantes" });
    }

    const data = produit.controlePeriodiqueData;
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
    drawText("🔍 Contrôle Périodique", 50, y, 16); y -= 30;
    drawText("Contrôle effectué par le revendeur agréé.", 50, y); y -= 40;
    
    drawText("Nom du revendeur :", 50, y);
    drawText(data.nomRevendeur, 250, y); y -= 25;
    drawText("Produit contrôlé :", 50, y);
    drawText(produit.name, 250, y); y -= 25;
    drawText("Numéro de série :", 50, y);
    drawText(data.numeroSerie, 250, y); y -= 25;
    drawText("Date du contrôle :", 50, y);
    drawText(data.dateControle, 250, y); y -= 25;
    drawText("Date de création du dossier :", 50, y);
    drawText(dossier.createdAt.toDate().toLocaleDateString('fr-FR'), 250, y); y -= 25;
    
    drawText("Résultats du contrôle :", 50, y); y -= 20;
    drawText(`État général : ${data.etatGeneral}`, 60, y); y -= 15;
    drawText(`Fonctionnement : ${data.fonctionnement}`, 60, y); y -= 15;
    drawText(`Sécurité : ${data.securite}`, 60, y); y -= 15;
    
    if (data.observations) {
      drawText("Observations :", 50, y); y -= 15;
      drawText(data.observations, 70, y); y -= 30;
    }
    
    drawText(`Résultat global : ${data.resultatGlobal}`, 50, y, 12); y -= 40;
    
    drawText("Prochain contrôle prévu le :", 50, y);
    if (data.prochainControle) {
      drawText(data.prochainControle, 250, y);
    }
    y -= 30;
    
    drawText("Date :", 50, y);
    drawText(data.dateControle, 100, y);
    drawText("Signature :", 300, y);

    if (data.signature) {
      const signatureImageBytes = Buffer.from(data.signature.split(",")[1], "base64");
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      const dims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, { x: 300, y: y - 60, width: dims.width, height: dims.height });
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `ControlePerio-${dossierId}-${productId}.pdf`;
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));
    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.uuid === productId
        ? {
            ...p,
            controlePeriodiqueStatus: 'completed',
            documents: {
              ...p.documents,
              controlePeriodique: { url: fileUrl, status: "complété" },
            },
          }
        : p
    );

    await dossierRef.update({ produits: produitsMaj });

    await sendNotificationToFit({
      type: "controlePeriodique_produit",
      dossierId,
      produitId,
      message: `🔍 Contrôle périodique effectué pour le produit "${produit.name}" dans le dossier "${dossier.orderName}".`,
    });

    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("❌ Erreur génération contrôle périodique :", error);
    res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

// Déclaration CE
const generateDeclarationCEForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

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

// Déclaration de montage
const generateDeclarationMontageForProduct = async (req, res) => {
  try {
    const { dossierId, productId } = req.params;

    console.log("Génération déclaration de montage pour dossier =", dossierId, "et produit =", productId);

    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

    const dossier = snapshot.data();
    const produit = dossier.produits.find(
      (p) => p.uuid === productId || p.productId === productId
    );
    
    if (!produit || !produit.declarationMontageData) {
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
    drawText("- la porte et ses options sont aptes à l'usage prévu", 60, y); y -= 30;

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

// Mise à jour statut document
const updateDocumentStatus = async (req, res) => {
  try {
    const { dossierId, productId, documentKey, url, status } = req.body;
    const dossierRef = db.collection("dossiers").doc(dossierId);
    const snapshot = await dossierRef.get();
    if (!snapshot.exists) return res.status(404).json({ error: "Dossier introuvable" });

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

// Notification à FIT
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

// Déclaration montage carrossier
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
  generateControlePeriodiqueForProduct,
  generateDeclarationMontageCarrossier, 
  sendNotificationToFit,
  createControlePeriodiqueNotification,
  checkControlePeriodiqueAvailability,
  calculateControlePeriodiqueDate,
  isControlePeriodiqueAvailable,
 };