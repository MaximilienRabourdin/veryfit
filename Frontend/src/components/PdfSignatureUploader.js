import React, { useState } from "react";
import { storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PdfSignatureUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Sélection du fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile || selectedFile.type !== "application/pdf") {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  // Envoi du fichier avec signature
  const handleUpload = async () => {
    if (!file || !signature) {
      setError("Sélectionnez un fichier et entrez une signature.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("signatureText", signature);
      formData.append("userId", "test-user"); // À remplacer par l'ID réel

      const response = await fetch(
        "http://veryfit-production.up.railway.app/api/documents/sign-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Erreur d'upload");

      console.log("✅ Fichier signé et uploadé :", data.fileUrl);
      onUploadSuccess(data.fileUrl); // Callback pour récupérer l'URL
    } catch (err) {
      setError("Erreur lors de l'upload. Vérifiez votre connexion.");
      console.error(err);
    }

    setUploading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-darkBlue mb-4">
        Signature & Upload PDF
      </h2>

      {/* Sélection du fichier */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* Zone pour la signature */}
      <input
        type="text"
        placeholder="Entrez votre signature"
        value={signature}
        onChange={(e) => setSignature(e.target.value)}
        className="border p-2 w-full rounded"
      />

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {/* Bouton de validation */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-red-600 text-white w-full py-2 mt-4 rounded hover:bg-red-700 transition"
      >
        {uploading ? "Envoi en cours..." : "Signer et Upload"}
      </button>
    </div>
  );
};

export default PdfSignatureUploader;
