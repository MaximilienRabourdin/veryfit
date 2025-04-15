import { PDFDocument, rgb } from "pdf-lib";
import { uploadFileToDrive } from "../../../Backend/services/googleDriveService"; // Ajuste selon ton organisation de fichiers

export const generatePdfForDossier = async (dossierId) => {
  try {
    // Créer un document PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    // Ajouter du contenu au PDF
    page.drawText("Déclaration de conformité CE", { x: 50, y: 350, size: 16, color: rgb(0, 0, 0) });
    page.drawText(`Dossier ID : ${dossierId}`, { x: 50, y: 320, size: 12 });

    // Sauvegarder le PDF en bytes
    const pdfBytes = await pdfDoc.save();

    // Uploader le fichier sur Google Drive
    const fileUrl = await uploadFileToDrive(pdfBytes, `DeclarationCE-${dossierId}.pdf`);

    return fileUrl; // Retourne l'URL du fichier PDF sur Google Drive
  } catch (error) {
    
    throw error; // Relancer l'erreur pour une gestion plus globale
  }
};
