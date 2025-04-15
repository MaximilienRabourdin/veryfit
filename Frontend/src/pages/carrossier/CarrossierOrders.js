import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { Link } from "react-router-dom";

const RevendeurOrders = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const auth = getAuth();

  const fetchDossiersValidés = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "dossiers"),
        where("revendeurEmail", "==", user.email),
        where("status", "==", "validé")
      );
      const snapshot = await getDocs(q);
      const validés = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDossiers(validés);
    } catch (error) {
      console.error("❌ Erreur récupération dossiers validés :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiersValidés();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">
        Dossiers CE Validés
      </h1>

      {loading ? (
        <p>Chargement en cours...</p>
      ) : dossiers.length === 0 ? (
        <p>Aucun dossier validé trouvé.</p>
      ) : (
        <div className="space-y-4">
          {dossiers.map((dossier) => (
            <div
              key={dossier.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="font-semibold text-lg text-darkBlue">
                📄 {dossier.orderName}
              </p>
              <p>
                <strong>Date de livraison :</strong> {dossier.deliveryDate}
              </p>
              <p>
                <strong>Status :</strong>{" "}
                <span className="bg-green-600 text-white text-sm px-2 py-1 rounded">
                  Validé
                </span>
              </p>

              <p className="mt-2">
                <strong>Produits :</strong>
              </p>
              <ul className="list-disc ml-6 text-sm">
                {Array.isArray(dossier.produits) ? (
                  dossier.produits.map((p, i) => (
                    <li key={i}>
                      {p.name} — Quantité : {p.quantity}
                    </li>
                  ))
                ) : (
                  <li className="text-red-600">Produits non valides</li>
                )}
              </ul>

              <div className="mt-4">
                <Link
                  to={`/revendeur/orders/${dossier.id}`}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Voir les détails du dossier →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevendeurOrders;
