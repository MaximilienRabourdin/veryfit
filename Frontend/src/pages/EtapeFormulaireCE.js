import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebaseConfig";
import { normalizeProduits } from "../utils/normalizeProduits";
import FormulaireWrapper from "../components/Formulaires/FormulaireWrapper";
import DeclarationMontageForm from "../pages/revendeur/DeclarationMontageForm";

const EtapeFormulaireCE = () => {
  const { orderId, stepIndex } = useParams();
  const navigate = useNavigate();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const step = parseInt(stepIndex || "0", 10); // sécurise bien la conversion

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("Utilisateur non connecté.");
          return;
        }

        const docRef = doc(db, "dossiers", orderId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.revendeurEmail !== user.email) {
            alert("⛔ Accès non autorisé à ce dossier.");
            return;
          }

          const produitsArray = normalizeProduits(data.produits);
          setOrder({ ...data, produits: produitsArray });
        } else {
          console.warn("❌ Dossier introuvable.");
        }
      } catch (e) {
        console.error("Erreur chargement dossier :", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const totalSteps = (order?.produits?.length || 0) + 1;
  const allFormsFilled = order?.produits?.every((p) => p.filled);

  const goToStep = (index) => {
    navigate(`/revendeur/orders/${orderId}/step/${index}`);
  };

  
  const renderStepContent = () => {
    if (step < order.produits.length) {
      return (
        <FormulaireWrapper
          produit={order.produits[step]}
          orderId={orderId}
          index={step}
          onNext={() => goToStep(step + 1)}
        />
      );
    }
  
    // Si tous les formulaires ne sont pas remplis
    if (!allFormsFilled) {
      return (
        <p className="text-orange-500 font-semibold">
          ❗ Veuillez remplir tous les formulaires de produits avant d’accéder à la déclaration de montage.
        </p>
      );
    }
  
    return <DeclarationMontageForm dossierId={orderId} />;
  };
  
  

  if (loading || !order) {
    return <p className="text-center mt-6">Chargement du dossier...</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-darkBlue">
        Dossier : {order.orderName}
      </h1>

      {/* Stepper visuel */}
      <div className="flex space-x-2 mb-6">
        {[...Array(totalSteps)].map((_, i) => {
          const isCompleted = i < order.produits.length
            ? order.produits[i].filled
            : allFormsFilled;
          const isActive = i === step;

          return (
            <div
              key={i}
              className={`flex-1 h-3 rounded ${
                isCompleted
                  ? "bg-green-500"
                  : isActive
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            ></div>
          );
        })}
      </div>

      <div className="bg-white rounded shadow p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => goToStep(Math.max(step - 1, 0))}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Précédent
        </button>

        <button
          onClick={() => goToStep(Math.min(step + 1, totalSteps - 1))}
          disabled={
            step >= totalSteps - 1 ||
            (step < order.produits.length && !order.produits[step].filled)
          }
          className="px-4 py-2 bg-darkBlue text-white rounded hover:bg-blue-800 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default EtapeFormulaireCE;
