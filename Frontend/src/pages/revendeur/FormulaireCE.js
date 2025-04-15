import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb } from "pdf-lib";
import { uploadToDrive } from "../services/uploadToDrive"; // Service d'upload
import { useParams } from "react-router-dom";

const FormulaireCE = () => {
  const { dossierId } = useParams(); // Récupérer l'ID du dossier depuis l'URL
  const [formData, setFormData] = useState({
    entreprise: "",
    responsableNom: "",
    responsableFonction: "",
    numeroSeriePorte: "",
    immatriculation: "",
    numeroSerieCarrosserie: "",
    numeroChassis: "",
    numeroHayon: "",
    natureIntervention: "",
    piecesChangees: "",
    remarques: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const sigCanvas = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  // **Génération du PDF**
  const generateSignedPDF = async () => {
    try {
      if (sigCanvas.current.isEmpty()) {
        alert("Ajoutez votre signature avant d'envoyer !");
        return null;
      }

      console.log("📌 Signature détectée, création du PDF...");

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);

      page.drawText(`Déclaration de montage - ${formData.entreprise}`, {
        x: 50,
        y: 350,
        size: 16,
        color: rgb(0, 0, 0),
      });

      // Ajouter la signature
      const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const response = await fetch(signatureImage);
      const imageBytes = await response.arrayBuffer();
      const signatureImageEmbed = await pdfDoc.embedPng(imageBytes);

      page.drawImage(signatureImageEmbed, {
        x: 50,
        y: 50,
        width: 200,
        height: 100,
      });

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: "application/pdf" });

    } catch (error) {
      console.error("❌ Erreur lors de la création du PDF :", error);
      return null;
    }
  };

  // **Envoi à Google Drive**
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📌 Génération du PDF en cours...");
      const pdfFile = await generateSignedPDF();
      if (!pdfFile) {
        setLoading(false);
        return;
      }

      console.log("📤 Upload du fichier :", pdfFile);

      const pdfFileAsFile = new File([pdfFile], `Dossier_CE_${dossierId}.pdf`, { type: "application/pdf" });

      const fileUrl = await uploadToDrive(pdfFileAsFile, dossierId);

      console.log("✅ Fichier stocké sur Google Drive :", fileUrl);
      setPdfUrl(fileUrl);
      alert("✅ Document signé et envoyé avec succès !");
    } catch (error) {
      console.error("❌ Erreur :", error);
      alert("Une erreur s'est produite lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">Formulaire CE</h1>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <label key={key} className="block mb-4">
            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} :
            <input
              type={key === "date" ? "date" : "text"}
              name={key}
              value={formData[key]}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </label>
        ))}

        <h2 className="text-xl font-semibold mb-4">Signature électronique :</h2>
        <div className="mb-4">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 700,
              height: 150,
              className: "border border-gray-300 rounded w-full max-w-lg mx-auto",
            }}
          />
          <button type="button" onClick={clearSignature} className="mt-2 bg-red-500 text-white py-1 px-3 rounded">
            Effacer la signature
          </button>
        </div>

        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded" disabled={loading}>
          {loading ? "Envoi en cours..." : "Signer et Envoyer"}
        </button>

        {pdfUrl && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h2 className="text-md font-semibold text-darkBlue">✅ Document signé :</h2>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Voir le document signé
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormulaireCE;
