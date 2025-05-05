import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { toast } from "react-toastify";

const CarrossierDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const auth = getAuth();

  const fetchDossiers = async () => {
    const user = auth.currentUser;
    if (!user) return console.error("Utilisateur non authentifié");

    try {
      const snapshot = await getDocs(
        query(
          collection(db, "dossiers"),
          where("revendeurEmail", "==", user.email),
          where("destinataire_type", "==", "Carrossier")
        )
      );
      const dossiersFiltres = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDossiers(dossiersFiltres);
    } catch (error) {
      console.error("Erreur récupération dossiers :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("❗ Confirmer la suppression ?")) return;
    try {
      await deleteDoc(doc(db, "dossiers", id));
      toast.success("✅ Dossier supprimé !");
      fetchDossiers();
    } catch (err) {
      console.error("Erreur suppression dossier :", err);
      toast.error("❌ Erreur lors de la suppression.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">📂 Mes Dossiers CE</h1>

      {loading ? (
        <p>Chargement en cours...</p>
      ) : dossiers.length === 0 ? (
        <p className="text-gray-600 italic">Aucun dossier CE disponible pour l’instant.</p>
      ) : (
        <div className="space-y-6">
          {dossiers.map((dossier) => (
            <div key={dossier.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <p className="text-lg font-bold text-blue-800">📄 {dossier.orderName}</p>
                  <p className="text-sm text-gray-600">
                    📅 Livraison : {dossier.deliveryDate || "—"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-medium mt-2 sm:mt-0 ${
                    dossier.status === "en_attente_remplissage"
                      ? "bg-yellow-200 text-yellow-800"
                      : dossier.status === "validé"
                      ? "bg-green-200 text-green-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {dossier.status}
                </span>
              </div>

              <div className="border-t pt-4 space-y-4">
                {Array.isArray(dossier.produits) && dossier.produits.length > 0 ? (
                  dossier.produits.map((p, i) => {
                    const produitId = p.uuid || p.productId; // ✅ utilise uuid si disponible
                    return (
                      <div
                        key={produitId + i}
                        className="p-4 rounded border bg-gray-50 space-y-2"
                      >
                        <div className="flex justify-between items-start flex-col sm:flex-row">
                          <p className="font-semibold text-sm mb-2 sm:mb-0">
                            🛠️ {p.name} — Quantité : {p.quantity || 1}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/carrossier/orders/${dossier.id}/produits/${produitId}`}
                              className={`text-sm px-3 py-1 rounded ${
                                p.filled
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-red-600 text-white hover:bg-red-700"
                              }`}
                            >
                              {p.filled ? "✅ Formulaire rempli" : "📝 Formulaire à remplir"}
                            </a>

                            {p.documents?.declarationMontage?.url ? (
                              <a
                                href={p.documents.declarationMontage.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                              >
                                🧾 Décl. montage
                              </a>
                            ) : (
                              <a
                                href={`/carrossier/orders/${dossier.id}/produits/${produitId}/declaration-montage`}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                              >
                                ✍️ Remplir déclaration montage
                              </a>
                            )}

                            {p.documents?.declarationCE?.url ? (
                              <a
                                href={p.documents.declarationCE.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                📄 Décl. CE
                              </a>
                            ) : (
                              <span className="text-xs text-red-500">❌ Décl. CE absente</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-red-600 text-sm">
                    ⚠️ Aucun produit associé au dossier.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-2">
                <a
                  href="https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                >
                  📘 Notice d'instruction
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarrossierDashboard;
