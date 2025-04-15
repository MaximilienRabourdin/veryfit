// ✅ Backend/utils/pdfCEGenerator.js
const { PDFDocument, rgb } = require("pdf-lib");

async function generateDeclarationCEPDF(dossier) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  page.drawText("Déclaration de conformité CE", {
    x: 50,
    y: 370,
    size: 18,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Dossier : ${dossier.orderName}`, { x: 50, y: 340, size: 12 });
  page.drawText(`Email : ${dossier.revendeurEmail}`, { x: 50, y: 320, size: 12 });
  page.drawText(`Date de livraison : ${dossier.deliveryDate}`, { x: 50, y: 300, size: 12 });

  dossier.produits.forEach((p, i) => {
    page.drawText(`Produit ${i + 1} : ${p.name}`, {
      x: 50,
      y: 280 - i * 20,
      size: 10,
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generateDeclarationCEPDF };
