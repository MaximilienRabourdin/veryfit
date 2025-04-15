// ✅ Déclaration CE - FRONTEND /pages/revendeur/DeclarationCEPreview.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DeclarationCEPreview = () => {
  const { orderId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const res = await fetch(
          `http://veryfit-production.up.railway.app/api/dossiers/generate/declaration-ce/${orderId}`
        );
        if (!res.ok) throw new Error("Erreur lors de la génération du PDF CE");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error(err);
        setError("Impossible de générer le PDF CE");
      }
    };

    fetchPDF();
  }, [orderId]);

  if (error) return <p className="text-red-600 text-center">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-darkBlue mb-4">
        Déclaration de Conformité CE
      </h1>
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Déclaration CE"
          className="w-full h-[80vh] border rounded"
        ></iframe>
      ) : (
        <p>Chargement du PDF...</p>
      )}
    </div>
  );
};

export default DeclarationCEPreview;
