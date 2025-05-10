import React from "react";

const PdfViewer = ({ url }) => {
  return (
    <div className="w-full h-[90vh] border rounded shadow bg-white">
      <iframe
        src={url}
        title="Aperçu PDF"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default PdfViewer;
