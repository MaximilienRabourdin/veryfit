// pages/fit/FitOrderDetails.js
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

  const formatValue = (val) => {
    if (typeof val === "boolean") return val ? "✅ Oui" : "❌ Non";
    if (Array.isArray(val)) return val.join("");
    if (typeof val === "string" && val.trim() === "") return "—";
    return val || "—";
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!order) return <div className="p-6 text-red-500">Dossier introuvable</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded shadow space-y-8">
      <h1 className="text-3xl font-bold text-darkBlue">🗂️ Dossier CE – {order.orderName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            <h3 className="text-lg font-bold text-blue-800 mb-1">
              {prod.name} – Série : {prod.porte?.NumeroSerie || "—"}
            </h3>
            <p className="text-sm mb-2 text-gray-700">
              Type de formulaire : <span className="italic">{prod.typeFormulaire || "—"}</span>
            </p>

            {prod.filled ? (
              <>
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-green-800 font-medium mb-4">
                  ✅ Formulaire de mise en service rempli
                </div>

                {Object.entries(data).map(([sectionName, sectionContent], i) => (
                  <div key={i} className="mb-4">
                    <h4 className="font-semibold text-blue-700 mb-1">📌 {sectionName}</h4>
                    <div className="pl-4 text-sm space-y-1">
                      {Object.entries(sectionContent).map(([field, value], j) => (
                        <div key={j}>
                          {typeof value === "object" && value !== null && !Array.isArray(value) ? (
                            <div>
                              <span className="font-medium">{field} :</span>
                              <ul className="ml-4 list-disc">
                                {Object.entries(value).map(([k, v]) => (
                                  <li key={k}>{k} : {formatValue(v)}</li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p>
                              <span className="font-medium">{field} :</span> {formatValue(value)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-4 space-y-1 text-sm">
                  <h4 className="font-semibold text-gray-800">📎 Documents disponibles :</h4>

                  {prod.documents?.declarationCE?.url ? (
                    <a
                      href={prod.documents.declarationCE.url}
                      className="text-blue-600 underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      📄 Télécharger déclaration CE
                    </a>
                  ) : (
                    <p className="text-red-500">❌ Déclaration CE non reçue</p>
                  )}

                  {prod.documents?.declarationMontage?.url ? (
                    <a
                      href={prod.documents.declarationMontage.url}
                      className="text-green-600 underline"
                      target="_blank" rel="noopener noreferrer"
                    >
                      🧾 Télécharger déclaration de montage
                    </a>
                  ) : (
                    <p className="text-red-500">❌ Déclaration de montage non reçue</p>
                  )}

                  <button
                    onClick={() => exportSinglePDF(index, prod.name)}
                    className="mt-2 bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                  >
                    📥 Télécharger ce formulaire en PDF
                  </button>
                </div>
              </>
            ) : (
              <p className="text-red-600 mt-2">❌ Formulaire non encore rempli</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FitOrderDetails;
