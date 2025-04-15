import React, { useState, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FormulaireSignature = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    reference: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const signatureRef = useRef(null);

  // 🔹 Met à jour les champs du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Fonction pour générer un PDF avec signature
  const generatePDF = async () => {
    setLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);

      page.drawText(`Référence : ${formData.reference}`, { x: 50, y: 350, size: 14 });
      page.drawText(`Client : ${formData.clientName}`, { x: 50, y: 320, size: 14 });
      page.drawText(`Date : ${formData.date}`, { x: 50, y: 290, size: 14 });

      // 🔹 Convertir la signature en image et l'ajouter au PDF
      if (!signatureRef.current.isEmpty()) {
        const signatureDataUrl = signatureRef.current.getTrimmedCanvas().toDataURL("image/png");
        const signatureBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
        const signatureImage = await pdfDoc.embedPng(signatureBytes);

        page.drawImage(signatureImage, {
          x: 50,
          y: 200,
          width: 150,
          height: 50,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

      // 🔹 Envoie du fichier à Firebase Storage
      const fileRef = ref(storage, `signed_documents/${Date.now()}_signed.pdf`);
      await uploadBytes(fileRef, pdfBlob);
      const fileUrl = await getDownloadURL(fileRef);

      setPdfUrl(fileUrl);
      onFormSubmit(fileUrl);
    } catch (error) {
      console.error("❌ Erreur génération PDF :", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-darkBlue mb-4">Déclaration de montage</h2>

      {/* 🔹 Champs du formulaire */}
      <input
        type="text"
        name="clientName"
        placeholder="Nom du client"
        value={formData.clientName}
        onChange={handleChange}
        className="border p-2 w-full mb-4 rounded"
      />
      <input
        type="text"
        name="reference"
        placeholder="Numéro de référence"
        value={formData.reference}
        onChange={handleChange}
        className="border p-2 w-full mb-4 rounded"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* 🔹 Zone de signature */}
      <h3 className="text-md font-semibold mb-2">Signature :</h3>
      <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        canvasProps={{ className: "border p-2 w-full h-20 rounded bg-gray-100" }}
      />
      <button onClick={() => signatureRef.current.clear()} className="text-red-600 mt-2">
        Effacer
      </button>

      {/* 🔹 Bouton d'envoi */}
      <button
        onClick={generatePDF}
        disabled={loading}
        className="bg-red-600 text-white w-full py-2 mt-4 rounded hover:bg-red-700 transition"
      >
        {loading ? "Envoi en cours..." : "Signer et Envoyer"}
      </button>

      {/* 🔹 Affichage du lien du PDF */}
      {pdfUrl && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="text-md font-semibold">✅ Document signé :</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Voir le document signé
          </a>
        </div>
      )}
    </div>
  );
};

export default FormulaireSignature;
