import React from "react";

const DeclarationMontageDetails = ({ declarationMontage }) => {
  if (!declarationMontage || !declarationMontage.data) {
    return <p className="text-gray-500 italic">Aucune déclaration de montage trouvée.</p>;
  }

  const { data, url, createdAt, signatureURL } = declarationMontage;

  const formatField = (label, value) => (
    <div className="flex justify-between border-b py-1">
      <span className="font-medium text-gray-700">{label}</span>
      <span>{value || "–"}</span>
    </div>
  );

  return (
    <div className="bg-white border p-4 rounded shadow mt-8">
      <h2 className="text-xl font-bold text-darkBlue mb-4">
        Déclaration de montage signée
      </h2>

      {createdAt && (
        <p className="text-sm text-gray-600 mb-4">
          Date de déclaration : {new Date(createdAt).toLocaleDateString("fr-FR")}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formatField("Nom du client", data.clientName)}
        {formatField("Contact client", data.clientContact)}
        {formatField("Adresse client", data.clientAddress)}
        {formatField("Numéro de série de la porte", data.doorSerial)}
        {formatField("Date de service", data.serviceDate)}
        {formatField("Nom du monteur", data.verifierName)}
        {formatField("Adresse du monteur", data.verifierAddress)}
        {formatField("Contact du monteur", data.verifierContact)}
        {formatField("Date d'intervention", data.verificationDate)}
      </div>

      {signatureURL && (
        <div className="mt-6">
          <p className="font-semibold mb-2">Signature :</p>
          <img
            src={signatureURL}
            alt="Signature du monteur"
            className="w-64 border p-2 bg-gray-50 rounded shadow"
          />
        </div>
      )}

      {url && (
        <div className="mt-6">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Télécharger le PDF signé
          </a>
        </div>
      )}
    </div>
  );
};

export default DeclarationMontageDetails;
