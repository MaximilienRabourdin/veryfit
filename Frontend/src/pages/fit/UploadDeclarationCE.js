import React, { useState } from "react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  getFirestore,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";

const UploadDeclarationCE = ({ orderId, destinataireEmail }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Veuillez sélectionner un fichier PDF.");

    setUploading(true);
    const storage = getStorage(app);
    const storageRef = ref(storage, `declarationsCE/${orderId}.pdf`);

    try {
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      const db = getFirestore(app);
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        "declarationCE.url": downloadURL,
        "declarationCE.nomFichier": selectedFile.name,
        "declarationCE.uploadedAt": new Date(),
      });

      setSuccess(true);
      alert("✅ Déclaration CE déposée avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      alert("❌ Erreur lors de l’upload du fichier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow mt-4">
      <h3 className="text-lg font-semibold mb-2">Déposer une déclaration CE (PDF)</h3>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-3"
      />
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {uploading ? "Téléversement en cours..." : "Téléverser le fichier"}
      </button>
      {success && (
        <p className="text-green-600 mt-2">✅ Fichier déposé avec succès.</p>
      )}
    </div>
  );
};

export default UploadDeclarationCE;
