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

const RevendeurDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const auth = getAuth();

  const fetchDossiers = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Utilisateur non authentifié");
      return;
    }

    try {
      const snapshot = await getDocs(
        query(
          collection(db, "dossiers"),
          where("revendeurEmail", "==", user.email)
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
    if (!window.confirm("❗ Confirmer la suppression de ce dossier ?")) return;
    try {
      await deleteDoc(doc(db, "dossiers", id));
      toast.success("✅ Dossier supprimé !");
      fetchDossiers();
    } catch (err) {
      console.error("Erreur suppression dossier :", err);
      toast.error("❌ Erreur suppression.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">Mes Dossiers CE</h1>

      {loading ? (
        <p>Chargement en cours...</p>
      ) : dossiers.length === 0 ? (
        <p>Aucun dossier CE trouvé.</p>
      ) : (
        <div className="space-y-4">
          {dossiers.map((dossier) => (
            <div key={dossier.id} className="bg-white rounded-lg shadow p-6">
              <p className="font-semibold text-lg text-darkBlue">
                📄 {dossier.orderName}
              </p>
              <p>
                <strong>Date de livraison :</strong> {dossier.deliveryDate}
              </p>
              <p>
                <strong>Statut :</strong>
                <span
                  className={`ml-2 px-2 py-1 rounded text-white text-sm ${
                    dossier.status === "en_attente_remplissage"
                      ? "bg-yellow-500"
                      : dossier.status === "validé"
                      ? "bg-green-600"
                      : "bg-gray-400"
                  }`}
                >
                  {dossier.status}
                </span>
              </p>

              <p className="mt-2">
                <strong>Produits :</strong>
              </p>
              <ul className="list-disc ml-6 text-sm">
                {Array.isArray(dossier.produits) &&
                dossier.produits.some((p) => p.typeFormulaire) ? (
                  dossier.produits.map((p, index) => (
                    <li key={index} className="border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm">
                    <div className="text-md font-semibold mb-2">
                      ✅ {p.name || "Produit inconnu"} — <span className="font-normal">Quantité : {p.quantity || 1}</span>
                    </div>
                  
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dossier.declarationCE?.base64 && (
                        <a
                          href={`data:application/pdf;base64,${dossier.declarationCE.base64}`}
                          download={dossier.declarationCE.name || "declaration_ce.pdf"}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
                        >
                          Télécharger Déclaration CE
                        </a>
                      )}
                  
                      {p.typeFormulaire && (
                        <a
                          href={`/revendeur/orders/${dossier.id}/produits/${p.productId}`}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                        >
                          Contrôle de montage et mise en service
                        </a>
                      )}
                  
                      {dossier.declarationMontage?.url ? (
                        <a
                          href={dossier.declarationMontage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                        >
                          Voir déclaration de montage
                        </a>
                      ) : (
                        <a
                          href={`/revendeur/orders/${dossier.id}/declaration-montage`}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm"
                        >
                          Déclaration de montage à signer
                        </a>
                      )}
                  
                      <a
                        href="https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition text-sm"
                      >
                        📘 Voir la notice
                      </a>
                    </div>
                  
                    {dossier.destinataire_type === "Carrossier" && (
                      <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm">
                        Contrôle périodique (à venir)
                      </div>
                    )}
                  </li>
                  
                  ))
                ) : (
                  <li className="text-red-600 font-semibold">
                    ⚠️ Produits non valides pour ce dossier.
                  </li>
                )}
              </ul>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {dossier.status !== "validé" && (
                  <button
                    onClick={() => handleDelete(dossier.id)}
                    className="bg-gray-200 text-red-600 px-4 py-2 rounded hover:bg-gray-300 transition"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevendeurDashboard;
