import React, { useState } from "react";

const UploadConformiteCE = ({ orderId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile || !orderId) {
      setMessage("Fichier ou dossier manquant.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("orderId", orderId);

    try {
      setUploading(true);
      const res = await fetch(
        "https://veryfit-backend.onrender.com/upload/conformite-ce",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");

      setMessage("✅ Fichier transmis !");
      setSelectedFile(null);
      onUploadSuccess?.(); // Refresh UI if needed
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("❌ Une erreur est survenue.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-bold mb-2">
        Déposer la déclaration CE (PDF)
      </h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-2"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {uploading ? "Envoi en cours..." : "Envoyer le PDF"}
      </button>

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default UploadConformiteCE;
