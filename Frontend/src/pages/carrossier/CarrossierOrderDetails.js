import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import FormulaireTypeA from "./FormulaireTypeACarrossier.js";
import FormulaireTypeB from "./FormulaireTypeBCarrossier.js";

const RevendeurOrderDetails = () => {
  const { orderId } = useParams();
  const db = getFirestore(app);
  const [dossier, setDossier] = useState(null);

  useEffect(() => {
    const fetchDossier = async () => {
      const docRef = doc(db, "dossiers", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDossier(docSnap.data());
      }
    };

    fetchDossier();
  }, [orderId]);

  if (!dossier) return <div className="p-6">Chargement du dossier...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-darkBlue mb-6">
        Formulaires de contrôle — {dossier.orderName}
      </h1>

      {dossier.produits?.map((produit, index) => (
        <div key={index}>
          {produit.typeFormulaire === "typeA" ? (
            <FormulaireTypeA produit={produit} />
          ) : (
            <FormulaireTypeB produit={produit} />
          )}
        </div>
      ))}
    </div>
  );
};

export default RevendeurOrderDetails;
