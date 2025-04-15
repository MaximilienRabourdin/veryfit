const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { updateDoc, doc } = require("firebase-admin/firestore");
const { db } = require("../config/firebaseAdmin");

const generateDeclarationPDF = async (req, res) => {
  try {
    const { orderId, formData } = req.body;

    if (!orderId || !formData) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();

    const drawText = (text, x, y) => {
      page.drawText(text, {
        x,
        y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    };

    drawText("Déclaration de Montage", 50, height - 50);
    drawText(`Numéro de dossier : ${formData.orderName}`, 50, height - 80);
    drawText(`Nom Client : ${formData.clientName}`, 50, height - 100);
    drawText(
      `Date de signature : ${new Date().toLocaleDateString()}`,
      50,
      height - 120
    );
    drawText(
      `Signature : ${formData.signature ? "✔️" : "✖️"}`,
      50,
      height - 140
    );

    const pdfBytes = await pdfDoc.save();
    const filename = `declaration_montage_${
      formData.orderName
    }_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../uploads", filename);
    fs.writeFileSync(filePath, pdfBytes);

    // 🔥 Enregistrement Firestore
    const firestoreRef = doc(db, "orders", orderId);
    await updateDoc(firestoreRef, {
      "declarationMontage.url": `http://veryfit-production.up.railway.app/uploads/${filename}`,
      "declarationMontage.createdAt": new Date().toISOString(),
    });

    res.status(200).json({
      message: "PDF généré avec succès",
      url: `http://veryfit-production.up.railway.app/uploads/${filename}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { generateDeclarationPDF };
