// 📁 Backend/utils/pdfCEGenerator.js
const { PDFDocument, rgb } = require("pdf-lib");

async function generateDeclarationCEPDF({ dossier }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  page.drawText("Déclaration de Conformité CE", {
    x: 50,
    y: 750,
    size: 20,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Numéro de dossier : ${dossier.orderName}`, { x: 50, y: 710, size: 12 });
  page.drawText(`Destinataire : ${dossier.revendeurEmail}`, { x: 50, y: 690, size: 12 });
  page.drawText(`Date de livraison : ${dossier.deliveryDate}`, { x: 50, y: 670, size: 12 });

  dossier.produits.forEach((p, i) => {
    const y = 640 - i * 20;
    page.drawText(`Produit ${i + 1} : ${p.name}`, { x: 50, y, size: 12 });
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

module.exports = { generateDeclarationCEPDF };
