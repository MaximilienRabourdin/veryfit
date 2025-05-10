// src/pages/fit/DeclarationMontagePreview.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PdfViewer from "../../components/PdfViewer";

const DeclarationMontagePreview = () => {
  const { orderId } = useParams();
  const isLocal = window.location.hostname === "localhost";

  const baseUrl = isLocal
    ? "http://localhost:5000"
    : "https://veryfit-production.up.railway.app";

  const [fileExists, setFileExists] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const pdfUrl = `${baseUrl}/uploads/DeclarationMontageCarrossier-${orderId}.pdf`;
    setUrl(pdfUrl);

    // Vérifier que le fichier existe réellement
    fetch(pdfUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) throw new Error("Fichier manquant");
        setFileExists(true);
      })
      .catch(() => setFileExists(false));
  }, [orderId, baseUrl]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-darkBlue">
        Déclaration de montage - Aperçu
      </h1>

      {fileExists ? (
        <PdfViewer url={url} />
      ) : (
        <p className="text-red-600 font-semibold">
          ❌ Le fichier PDF est introuvable.
          <br />
          Vérifie que la déclaration a bien été générée et que le fichier est disponible.
        </p>
      )}
    </div>
  );
};

export default DeclarationMontagePreview;
