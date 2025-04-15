import React from "react";

const FitDocumentViewer = ({ title, url, content }) => {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-lg font-semibold mb-2 text-darkBlue">{title}</h2>

      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          📥 Voir le document
        </a>
      ) : (
        <div className="bg-gray-50 p-3 rounded text-sm">
          {Object.entries(content).map(([section, val], i) => (
            <div key={i} className="mb-2">
              <strong>{section}</strong>:{" "}
              {typeof val === "object"
                ? Object.entries(val).map(([k, v]) => (
                    <span key={k} className="inline-block ml-2">
                      {k}: <span className="font-mono">{v}</span>
                    </span>
                  ))
                : val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FitDocumentViewer;
