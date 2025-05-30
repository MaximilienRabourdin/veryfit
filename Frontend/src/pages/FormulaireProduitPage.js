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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        console.log("🔍 Recherche du dossier:", orderId);
        console.log("🔍 Recherche du produit:", produitId);
        
        const dossierRef = doc(db, "dossiers", orderId);
        const dossierSnap = await getDoc(dossierRef);
        
        if (!dossierSnap.exists()) {
          throw new Error("Dossier introuvable");
        }
        
        const dossier = dossierSnap.data();
        console.log("📂 Dossier trouvé:", dossier.orderName);
        console.log("📦 Nombre de produits:", dossier.produits?.length || 0);
        
        if (!dossier.produits || !Array.isArray(dossier.produits)) {
          throw new Error("Aucun produit trouvé dans le dossier");
        }
        
        // 🔹 CORRECTION : Chercher par uuid OU par productId
        const index = dossier.produits.findIndex((prod) => 
          prod.uuid === produitId || prod.productId === produitId
        );
        
        console.log("🔍 Index trouvé:", index);
        
        if (index === -1) {
          console.log("❌ Produit non trouvé. Produits disponibles:");
          dossier.produits.forEach((p, i) => {
            console.log(`  ${i}: uuid=${p.uuid}, productId=${p.productId}, name=${p.name}`);
          });
          throw new Error("Produit non trouvé dans le dossier");
        }
        
        const p = dossier.produits[index];
        console.log("✅ Produit trouvé:", p.name, "- Type:", p.typeFormulaire);
        
        setProduit(p);
        setType(p.typeFormulaire || "typeA"); // Fallback vers typeA
        setIndexProduit(index);
        
      } catch (error) {
        console.error("❌ Erreur lors de la récupération:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && produitId) {
      fetchProduit();
    } else {
      setError("Paramètres manquants (orderId ou produitId)");
      setLoading(false);
    }
  }, [orderId, produitId, db]);

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement du produit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">❌ Erreur</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Dossier ID:</strong> {orderId}</p>
            <p><strong>Produit ID:</strong> {produitId}</p>
          </div>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  if (!produit || indexProduit === null) {
    return (
      <div className="p-6 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold">⚠️ Produit introuvable</h3>
          <p className="text-yellow-600 mt-2">Le produit demandé n'a pas été trouvé dans ce dossier.</p>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Retour au dossier
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Contrôle de Montage et Mise en Service
              </h1>
              <p className="text-gray-600 mt-1">
                Produit: <span className="font-semibold">{produit.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Type de formulaire: <span className="font-medium">{type}</span>
              </p>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>

        {/* Rendu du formulaire selon le type */}
        {type === "typeA" ? (
          <FormulaireTypeA 
            produit={produit} 
            orderId={orderId} 
            index={indexProduit} 
            onNext={() => window.history.back()} 
          />
        ) : type === "typeB" ? (
          <FormulaireTypeB 
            produit={produit} 
            orderId={orderId} 
            index={indexProduit} 
            onNext={() => window.history.back()} 
          />
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-red-800 font-semibold mb-2">❌ Type de formulaire inconnu</h3>
            <p className="text-red-600">Type détecté: <code>{type}</code></p>
            <p className="text-sm text-gray-600 mt-2">
              Les types supportés sont: <code>typeA</code> et <code>typeB</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormulaireProduitPage;