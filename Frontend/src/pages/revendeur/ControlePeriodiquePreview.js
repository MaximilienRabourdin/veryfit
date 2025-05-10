// ControlePeriodiquePreview.js
import React from "react";

const ControlePeriodiquePreview = ({ pdfUrl }) => {
  if (!pdfUrl) return null;

  const previewUrl = `${pdfUrl}?t=${Date.now()}`; // empêche le cache

  return (
    <div className="border mt-2 w-full max-w-md shadow rounded overflow-hidden">
      <iframe
        src={previewUrl}
        title="Aperçu PDF Contrôle Périodique"
        width="100%"
        height="500"
        className="border-0"
      />
    </div>
  );
};

export default ControlePeriodiquePreview;
