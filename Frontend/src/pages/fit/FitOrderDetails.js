import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FitOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const formRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, "dossiers", orderId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          console.warn("Dossier introuvable.");
        }
      } catch (e) {
        console.error("Erreur Firestore:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const exportSinglePDF = async (index, name) => {
    const ref = formRefs.current[index];
    if (!ref) return;

    const canvas = await html2canvas(ref, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`Formulaire_${name}.pdf`);
  };

  const exportAllPDFs = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < formRefs.current.length; i++) {
      const ref = formRefs.current[i];
      if (!ref) continue;

      const canvas = await html2canvas(ref, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
    }

    pdf.save(`Dossier_CE_${order.orderName || order.id}.pdf`);
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!order) return <div className="p-6 text-red-500">Dossier introuvable</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-3xl font-bold text-darkBlue">🗂️ Dossier CE – {order.orderName}</h1>

      <div className="grid grid-cols-2 gap-4">
        <p><strong>Numéro :</strong> {order.id}</p>
        <p><strong>Destinataire :</strong> {order.revendeur}</p>
        <p><strong>Email :</strong> {order.revendeurEmail}</p>
        <p><strong>Statut :</strong> {order.status}</p>
      </div>

      <button
        onClick={exportAllPDFs}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        📁 Télécharger tous les formulaires du dossier en PDF
      </button>

      <h2 className="text-xl font-semibold mt-6 mb-2">📦 Produits</h2>

      {order.produits?.map((prod, index) => {
        const data = prod.formulaire || prod.formulaireData || {};
        return (
          <div
            key={index}
            ref={(el) => (formRefs.current[index] = el)}
            className="border border-gray-300 p-4 mb-6 rounded bg-gray-50 shadow-sm"
          >
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              {prod.name} – Série : {prod.porte?.NumeroSerie || "—"}
            </h3>

            <p className="text-sm text-gray-700 mb-2">
              Type de formulaire : <span className="italic">{prod.typeFormulaire}</span>
            </p>

            {prod.filled ? (
              <>
                <div className="bg-green-50 border-l-4 border-green-400 p-2 text-green-800 rounded mb-4">
                  ✅ Formulaire de mise en service rempli
                </div>

                {/* ✅ Affichage sécurisé des sections avec sous-objets */}
                {Object.entries(data).map(([sectionName, sectionData], i) => (
                  <div key={i} className="mt-4">
                    <h4 className="text-md font-semibold text-blue-700 mb-1">
                      📌 {sectionName}
                    </h4>
                    <div className="ml-2 border-l border-gray-300 pl-4 space-y-1">
                      {Object.entries(sectionData).map(([field, value], j) => {
                        if (typeof value === "object" && value !== null) {
                          return (
                            <div key={j}>
                              <p className="font-medium">{field} :</p>
                              <ul className="ml-4 list-disc text-sm">
                                {Object.entries(value).map(([subKey, subVal], k) => (
                                  <li key={k}>
                                    {subKey} :{" "}
                                    {typeof subVal === "boolean"
                                      ? subVal
                                        ? "✅ Oui"
                                        : "❌ Non"
                                      : subVal || "—"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        }

                        return (
                          <p key={j} className="text-sm">
                            <span className="font-medium">{field} :</span>{" "}
                            {typeof value === "boolean"
                              ? value
                                ? "✅ Oui"
                                : "❌ Non"
                              : value || "—"}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-2 mt-6">
                  <h4 className="font-semibold">📎 Documents disponibles :</h4>

                  {prod.documents?.declarationCE?.url ? (
                    <a
                      href={prod.documents.declarationCE.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      📄 Télécharger déclaration CE
                    </a>
                  ) : (
                    <p className="text-sm text-red-500">❌ Déclaration CE non reçue.</p>
                  )}

                  {prod.documents?.declarationMontage?.url ? (
                    <a
                      href={prod.documents.declarationMontage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline"
                    >
                      🧾 Télécharger déclaration de montage
                    </a>
                  ) : (
                    <p className="text-sm text-red-500">❌ Déclaration de montage non reçue.</p>
                  )}

                  <button
                    onClick={() => exportSinglePDF(index, prod.name)}
                    className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700 mt-2 w-fit"
                  >
                    📥 Télécharger ce formulaire en PDF
                  </button>
                </div>
              </>
            ) : (
              <p className="text-red-600 mt-2">Formulaire non encore rempli ❌</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FitOrderDetails;
