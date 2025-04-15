// utils/pdf.js
const { PDFDocument, rgb } = require("pdf-lib");

const generateDeclarationCEPDF = async ({ orderName, revendeur, produits, deliveryDate }) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    const textOptions = { size: 12, color: rgb(0, 0, 0) };
    let y = 750;

    page.drawText("Déclaration de Conformité CE", {
      x: 50,
      y,
      size: 18,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    page.drawText(`Numéro de dossier : ${orderName}`, { x: 50, y, ...textOptions });
    y -= 20;
    page.drawText(`Revendeur : ${revendeur}`, { x: 50, y, ...textOptions });
    y -= 20;
    page.drawText(`Date de livraison : ${deliveryDate}`, { x: 50, y, ...textOptions });
    y -= 40;

    page.drawText("Produits :", { x: 50, y, ...textOptions });
    y -= 20;
    produits.forEach((p, idx) => {
      page.drawText(`- ${p.name} (Quantité : ${p.quantity})`, { x: 60, y, ...textOptions });
      y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    
    throw error;
  }
};

module.exports = { generateDeclarationCEPDF };
