import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";

import FormulaireTypeA from "./FormulaireTypeACarrossier";
import FormulaireTypeB from "./FormulaireTypeBCarrossier";
import DeclarationMontageForm from "./DeclarationMontageCarrossierForm";
import VeryfitLoader from "../../components/VeryfitLoader";

const EtapeFormulaireCarrossier = () => {
  const { orderId, stepIndex } = useParams();
  const db = getFirestore(app);
  const navigate = useNavigate();

  const [dossier, setDossier] = useState(null);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentStep = parseInt(stepIndex);

  const fetchDossier = async () => {
    try {
      const dossierRef = doc(db, "dossiers", orderId);
      const snap = await getDoc(dossierRef);
      if (!snap.exists()) return;

      const data = snap.data();
      setDossier({ id: snap.id, ...data });
      setProduits(data.produits || []);
    } catch (err) {
      console.error("Erreur chargement dossier :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [orderId]);

  const handleSuivant = () => {
    if (currentStep < produits.length) {
      navigate(`/carrossier/orders/${orderId}/step/${currentStep + 1}`);
    }
  };

  if (loading) return <VeryfitLoader />;
  if (!dossier) return <p>Dossier introuvable</p>;

  const produit = produits[currentStep];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-darkBlue">
        Étape {currentStep + 1} / {produits.length + 1}
      </h2>

      {/* Étapes de produit */}
      {currentStep < produits.length ? (
        <>
          <p className="mb-4 font-medium">Produit : {produit.name}</p>
          {produit.typeFormulaire === "typeA" && (
            <FormulaireTypeA
              dossierId={dossier.id}
              produit={produit}
              onComplete={handleSuivant}
            />
          )}
          {produit.typeFormulaire === "typeB" && (
            <FormulaireTypeB
              dossierId={dossier.id}
              produit={produit}
              onComplete={handleSuivant}
            />
          )}
        </>
      ) : (
        // Étape finale : Déclaration de montage
        <DeclarationMontageForm dossier={dossier} />
      )}
    </div>
  );
};

export default EtapeFormulaireCarrossier;
