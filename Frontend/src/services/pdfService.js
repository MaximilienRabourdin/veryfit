import { jsPDF } from "jspdf";

export const generatePdfForDossier = async (dossierId) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Déclaration CE", 20, 20);

  doc.setFontSize(12);
  doc.text(`Dossier ID : ${dossierId}`, 20, 40);
  doc.text("Ceci est un exemple de PDF généré automatiquement.", 20, 50);

  const pdfBytes = doc.output("datauristring"); // format base64 URI

  return pdfBytes; // ✅ retourne bien les données du PDF
};
