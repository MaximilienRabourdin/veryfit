// generateControlePeriodiquePDF.js
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { getFirestore } = require("firebase-admin/firestore");

const db = getFirestore();

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const generateControlePeriodiquePDF = async (req, res) => {
  try {
    const { dossierId, produitId } = req.params;
    const controleData = req.body;

    const dossierSnap = await db.collection("dossiers").doc(dossierId).get();
    if (!dossierSnap.exists) {
      return res.status(404).json({ error: "Dossier introuvable" });
    }

    const dossier = dossierSnap.data();
    const produit = dossier.produits.find(
      (p) => p.uuid === produitId || p.productId === produitId
    );

    if (!produit) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 portrait
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    let y = height - 50;
    const leftMargin = 50;
    const contentWidth = width - leftMargin * 2;

    const drawText = (text, x, y, size = 12, bold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // === Logo VERIFIT en discret ===
    const logoPath = path.resolve(__dirname, "../assets/fit_logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoDims = logoImage.scale(0.1);
    page.drawImage(logoImage, {
      x: leftMargin,
      y: y - logoDims.height,
      width: logoDims.width,
      height: logoDims.height,
    });
    y -= logoDims.height + 20;

    drawText(`Contrôle Périodique – Dossier : ${dossier.orderName || dossierId}`, leftMargin + 100, y, 14); y -= 30;

    // === Informations générales ===
    const infos = [
      `Produit : ${produit.name || "—"}`,
      `Numéro de série : ${controleData.porteNumeroSerie || "—"}`,
      `Client : ${controleData.clientNom || "—"}`,
      `Date du contrôle : ${controleData.date || "—"}`,
    ];

    infos.forEach((info) => {
      drawText(info, leftMargin, y); y -= 20;
    });

    y -= 10;
    drawText("Résumé des contrôles :", leftMargin, y, 14); y -= 20;

    const allSections = controleData.controles || {};
    for (const [sectionKey, sectionValues] of Object.entries(allSections)) {
      if (Object.keys(sectionValues).length === 0) continue;

      drawText(sectionKey.toUpperCase(), leftMargin, y, 12); y -= 15;

      for (const [question, value] of Object.entries(sectionValues)) {
        page.drawRectangle({
          x: leftMargin - 2,
          y: y - 2,
          width: contentWidth,
          height: 14,
          borderWidth: 0.5,
          borderColor: rgb(0.8, 0.8, 0.8),
        });
        drawText(`${question} : ${value}`, leftMargin + 4, y, 10); y -= 16;

        if (y < 80) {
          page = pdfDoc.addPage([595, 842]);
          y = height - 50;
        }
      }
      y -= 10;
    }

    if (controleData.probleme) {
      drawText("Problème identifié :", leftMargin, y, 12); y -= 15;
      drawText(`Type : ${controleData.probleme}`, leftMargin + 10, y); y -= 15;
      drawText(`Commentaire : ${controleData.commentaireProbleme || "—"}`, leftMargin + 10, y); y -= 25;
    }

    drawText("Fait le : " + (controleData.date || "—"), leftMargin, y); y -= 20;
    drawText("Signature du vérificateur :", leftMargin, y); y -= 60;

    if (controleData.signature && controleData.signature.startsWith("data:image")) {
      const base64 = controleData.signature.split(",")[1];
      const signatureBytes = Buffer.from(base64, "base64");
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      const signatureDims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, {
        x: leftMargin + 150,
        y: y,
        width: signatureDims.width,
        height: signatureDims.height,
      });
      y -= signatureDims.height + 20;
    }

    const uploadsDir = ensureUploadsDir();
    const fileName = `controle_periodique_${dossierId}_${produitId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    const url = `http://localhost:5000/uploads/${fileName}`;

    const produitsMaj = dossier.produits.map((p) =>
      p.uuid === produitId || p.productId === produitId
        ? {
            ...p,
            documents: {
              ...p.documents,
              controlePeriodique: {
                url,
                status: "complété",
              },
            },
          }
        : p
    );

    await db.collection("dossiers").doc(dossierId).update({ produits: produitsMaj });

    return res.json({ success: true, url });
  } catch (error) {
    console.error("❌ Erreur PDF contrôle périodique :", error);
    return res.status(500).json({ error: "Erreur serveur", details: error.message });
  }
};

module.exports = {
  generateControlePeriodiquePDF,
};
