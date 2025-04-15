import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

import FormulaireTypeA from "./FormulaireTypeACarrossier";
import FormulaireTypeB from "./FormulaireTypeBCarrossier";

const FormulaireCarrossierProduit = () => {
  const { orderId, produitId } = useParams();
  const db = getFirestore(app);

  const [produit, setProduit] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduit = async () => {
    try {
      const dossierRef = doc(db, "dossiers", orderId);
      const dossierSnap = await getDoc(dossierRef);

      if (dossierSnap.exists()) {
        const dossierData = dossierSnap.data();
        const produitSelectionne = dossierData.produits.find(
          (p) => p.productId === produitId
        );

        setDossier({ id: dossierSnap.id, ...dossierData });
        setProduit(produitSelectionne);
      } else {
        console.error("Dossier introuvable.");
      }
    } catch (err) {
      console.error("Erreur chargement produit :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduit();
  }, [orderId, produitId]);

  if (loading) return <p>Chargement du formulaire...</p>;
  if (!produit) return <p>Produit introuvable dans le dossier.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4 text-darkBlue">
        Formulaire CE : {produit.name}
      </h1>

      {produit.typeFormulaire === "typeA" ? (
        <FormulaireTypeA
          produit={produit}
          orderId={dossier.id}
          index={dossier.produits.findIndex((p) => p.productId === produitId)}
          onNext={() => console.log("next")}
        />
      ) : produit.typeFormulaire === "typeB" ? (
        <FormulaireTypeB
          produit={produit}
          orderId={dossier.id}
          index={dossier.produits.findIndex((p) => p.productId === produitId)}
          onNext={() => console.log("next")}
        />
      ) : (
        <p className="text-red-500">
          ❌ Type de formulaire inconnu pour ce produit.
        </p>
      )}
    </div>
  );
};

export default FormulaireCarrossierProduit;
