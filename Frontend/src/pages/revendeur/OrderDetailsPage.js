// 📁 pages/revendeur/OrderDetailsPage.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import FormulaireWrapper from "../../components/Formulaires/FormulaireWrapper";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const ref = doc(db, "dossiers", orderId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setDossier({ id: snap.id, ...snap.data() });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du dossier :", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [orderId]);

  if (loading) return <p className="p-6">Chargement en cours...</p>;
  if (notFound) return <p className="p-6 text-red-600">❌ Dossier non trouvé dans Firestore.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Formulaires pour le dossier : {dossier.orderName || dossier.id}
      </h1>

      {Array.isArray(dossier.produits) && dossier.produits.length > 0 ? (
        dossier.produits.map((produit, index) => (
          <FormulaireWrapper key={index} produit={produit} orderId={orderId} index={index} />
        ))
      ) : (
        <p>Aucun produit trouvé dans ce dossier.</p>
      )}
    </div>
  );
};

export default OrderDetailsPage;
