import React from "react";
import FormulaireTypeA from "./FormulaireTypeA";
import FormulaireTypeB from "./FormulaireTypeB";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { toast } from "react-toastify";

const db = getFirestore(app);

const FormulaireWrapper = ({ produit, orderId, index, onNext }) => {

  const handleAfterSubmit = async () => {
    try {
      const dossierRef = doc(db, "dossiers", orderId);
      const snapshot = await getDoc(dossierRef);
      if (!snapshot.exists()) return;

      const dossierData = snapshot.data();
      let produits = Array.isArray(dossierData.produits)
        ? dossierData.produits
        : Object.values(dossierData.produits || {});

      // Mise à jour du statut du document pour ce produit
      produit.documents.declarationCE.status = "validé"; // Exemple
      produit.documents.controleMontage.status = "en cours"; // Exemple
      produit.documents.declarationMontage.status = "à remplir"; // Exemple

      // Vérifie si tous les produits sont remplis
      const allFilled = produits.every((p) => 
        p.documents.declarationCE.status === "validé" &&
        p.documents.controleMontage.status === "validé" &&
        p.documents.declarationMontage.status === "validé"
      );

      const updatePayload = {
        produits: produits.map((p) => ({ ...p })), // Met à jour tous les produits
        status: allFilled ? "validé" : dossierData.status, // Si tous les produits sont validés, marque le dossier comme validé
      };

      if (allFilled) {
        toast.success("🎉 Tous les formulaires remplis. Dossier validé !");
      }

      await updateDoc(dossierRef, updatePayload);
      onNext(); // Va à l'étape suivante, si nécessaire
    } catch (err) {
      console.error("❌ Erreur validation formulaire :", err);
      toast.error("Erreur lors de la mise à jour du dossier.");
    }
  };

  const commonProps = {
    produit,
    orderId,
    index,
    onNext,
    onSubmitSuccess: handleAfterSubmit,
  };

  // Affiche le bon formulaire selon le type de produit
  if (produit.typeFormulaire === "typeA") return <FormulaireTypeA {...commonProps} />;
  if (produit.typeFormulaire === "typeB") return <FormulaireTypeB {...commonProps} />;
  
  return <p className="text-red-500">Type inconnu : {produit.typeFormulaire}</p>;
};

export default FormulaireWrapper;
