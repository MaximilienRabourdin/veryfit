// frontend/pages/carrossier/CarrossierDashboard.js
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
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">Mes Dossiers CE</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : dossiers.length === 0 ? (
        <p>Aucun dossier CE trouvé.</p>
      ) : (
        <div className="space-y-6">
          {dossiers.map((dossier) => (
            <div key={dossier.id} className="bg-white rounded-lg shadow p-6">
              <p className="text-lg font-semibold text-darkBlue">📄 {dossier.orderName}</p>
              <p><strong>Livraison :</strong> {dossier.deliveryDate}</p>
              <p>
                <strong>Statut :</strong>{" "}
                <span className={`px-2 py-1 rounded text-white text-sm ${
                  dossier.status === "en_attente_remplissage"
                    ? "bg-yellow-500"
                    : dossier.status === "validé"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}>
                  {dossier.status}
                </span>
              </p>

              <ul className="list-disc ml-6 mt-4 text-sm space-y-2">
                {Array.isArray(dossier.produits) && dossier.produits.length > 0 ? (
                  dossier.produits.map((p, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span>{p.name} — Quantité : {p.quantity}</span>
                        <div className="flex flex-wrap gap-2">
                          {/* Formulaire mise en service */}
                          {p.typeFormulaire && (
                            <a
                              href={`/carrossier/orders/${dossier.id}/produits/${p.productId}`}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Formulaire mise en service
                            </a>
                          )}

                          {/* Déclaration de montage */}
                          {p.documents?.declarationMontage?.url && (
                            <a
                              href={p.documents.declarationMontage.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Déclaration de montage
                            </a>
                          )}

                          {/* Déclaration CE */}
                          {p.documents?.declarationCE?.url && (
                            <a
                              href={p.documents.declarationCE.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Déclaration CE
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-red-600">⚠️ Aucun produit valide.</li>
                )}
              </ul>

              {/* Déclaration globale de montage */}
              <div className="mt-5 flex flex-wrap gap-3">
                {!dossier.declarationMontage?.url ? (
                  <a
                    href={`/carrossier/orders/${dossier.id}/declaration-montage`}
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                  >
                    Remplir déclaration de montage globale
                  </a>
                ) : (
                  <a
                    href={dossier.declarationMontage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
                  >
                    Voir déclaration de montage globale
                  </a>
                )}

                {/* Notice */}
                <a
                  href="https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  📘 Notice d'instruction
                </a>

                {/* Suppression */}
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarrossierDashboard;
