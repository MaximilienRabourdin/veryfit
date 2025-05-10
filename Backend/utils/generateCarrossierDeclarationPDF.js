// utils/generateCarrossierDeclarationPDF.js
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
};

const generateCarrossierDeclarationPDF = async (dossierId, data, orderName = "") => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const logoPath = path.join(__dirname, "../assets/fit_logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);

    const { width, height } = page.getSize();
    const logoDims = logoImage.scale(0.3);
    page.drawImage(logoImage, {
      x: 40,
      y: height - 80,
      width: logoDims.width,
      height: logoDims.height,
    });

    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.8, 0, 0),
      borderWidth: 2,
    });

    let y = height - 120;
    const draw = (label, value) => {
      page.drawText(String(label), {
        x: 50,
        y,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(value || "—"), {
        x: 250,
        y,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      y -= 25;
    };

    page.drawText("Déclaration de montage - Carrossier", {
      x: 50,
      y,
      size: 16,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    draw("Dossier :", orderName || dossierId);
    draw("Nom du carrossier :", data.nomCarrossier);
    draw("Numéro de série :", data.numeroSerie);
    draw("Date du montage :", data.dateMontage);

    page.drawText("Observations :", { x: 50, y, size: 12, font: helvetica });
    page.drawText(String(data.observations || "—"), { x: 70, y: y - 15, size: 12, font: helvetica });
    y -= 80;

    page.drawText("Par cette déclaration, je certifie que :", { x: 50, y, size: 12, font: helvetica });
    y -= 20;
    const points = [
      "la porte et ses options ont été montées conformément aux instructions",
      "le test et le contrôle ont obtenu un résultat positif",
      "la porte et ses options sont aptes à l’usage prévu",
    ];
    points.forEach((p) => {
      page.drawText(`- ${p}`, { x: 60, y, size: 12, font: helvetica });
      y -= 18;
    });

    y -= 20;
    page.drawText("Date :", { x: 50, y, size: 12, font: helvetica });
    page.drawText(String(data.dateMontage || "—"), { x: 100, y, size: 12, font: helvetica });
    page.drawText("Signature :", { x: 300, y, size: 12, font: helvetica });

    if (data.signature) {
      const signatureBytes = Buffer.from(data.signature.split(",")[1], "base64");
      const signatureImage = await pdfDoc.embedPng(signatureBytes);
      const dims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, {
        x: 300,
        y: y - 60,
        width: dims.width,
        height: dims.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const uploadsDir = ensureUploadsDir();
    const fileName = `DeclarationMontageCarrossier-${dossierId}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));

    const fileUrl = `http://veryfit-production.up.railway.app/uploads/${fileName}`;
    return fileUrl;
  } catch (err) {
    console.error("Erreur PDF carrossier:", err);
    throw new Error(err.message);
  }
};

module.exports = { generateCarrossierDeclarationPDF };
