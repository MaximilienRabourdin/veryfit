import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormulaireTypeA from "../components/Formulaires/FormulaireTypeA";
import FormulaireTypeB from "../components/Formulaires/FormulaireTypeB";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

const FormulaireProduitPage = () => {
  const { orderId, produitId } = useParams();
  const [produit, setProduit] = useState(null);
  const [type, setType] = useState("");
  const [indexProduit, setIndexProduit] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchProduit = async () => {
      const dossierRef = doc(db, "dossiers", orderId);
      const dossierSnap = await getDoc(dossierRef);
      if (dossierSnap.exists()) {
        const dossier = dossierSnap.data();
        const index = dossier.produits.findIndex((prod) => prod.productId === produitId);
        const p = dossier.produits[index];
        if (p) {
          setProduit(p);
          setType(p.typeFormulaire);
          setIndexProduit(index);
        }
      }
    };

    fetchProduit();
  }, [orderId, produitId]);

  if (!produit || indexProduit === null) return <p className="p-6">Chargement du produit...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Formulaire pour : {produit.name}</h2>
      {type === "typeA" ? (
        <FormulaireTypeA produit={produit} orderId={orderId} index={indexProduit} onNext={() => window.history.back()} />
      ) : type === "typeB" ? (
        <FormulaireTypeB produit={produit} orderId={orderId} index={indexProduit} onNext={() => window.history.back()} />
      ) : (
        <p>Type de formulaire inconnu</p>
      )}
    </div>
  );
};

export default FormulaireProduitPage;
