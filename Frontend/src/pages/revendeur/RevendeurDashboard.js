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

import ControlePeriodiquePreview from "./ControlePeriodiquePreview";
import AssignProductToClient from "./AssignProductClient";

const RevendeurDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour le modal d'assignation
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  
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
          where("destinataire_type", "==", "Revendeur")
        )
      );
      const dossiersFiltres = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // 🔹 NOUVEAU : Convertir les timestamps Firestore
          createdAt: data.createdAt?.toDate() || new Date(),
          controlePeriodiqueDate: data.controlePeriodiqueDate?.toDate() || null
        };
      });
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

  // 🔹 NOUVEAU : Vérifier si le contrôle périodique est disponible
  const isControleAvailable = (dossier) => {
    if (!dossier.controlePeriodiqueDate) return false;
    
    const now = new Date();
    let controleDate;
    
    // Gérer les différents types de date
    if (dossier.controlePeriodiqueDate.toDate && typeof dossier.controlePeriodiqueDate.toDate === 'function') {
      controleDate = dossier.controlePeriodiqueDate.toDate();
    } else if (dossier.controlePeriodiqueDate instanceof Date) {
      controleDate = dossier.controlePeriodiqueDate;
    } else {
      controleDate = new Date(dossier.controlePeriodiqueDate);
    }
    
    return controleDate <= now;
  };

  // 🔹 NOUVEAU : Calculer les jours restants
  const getDaysRemaining = (dossier) => {
    if (!dossier.controlePeriodiqueDate) return 0;
    
    const now = new Date();
    let controleDate;
    
    // Gérer les différents types de date
    if (dossier.controlePeriodiqueDate.toDate && typeof dossier.controlePeriodiqueDate.toDate === 'function') {
      controleDate = dossier.controlePeriodiqueDate.toDate();
    } else if (dossier.controlePeriodiqueDate instanceof Date) {
      controleDate = dossier.controlePeriodiqueDate;
    } else {
      controleDate = new Date(dossier.controlePeriodiqueDate);
    }
    
    const diffTime = controleDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // 🔹 NOUVEAU : Formater la date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    // Gérer les différents types de date
    let dateObj;
    if (date.toDate && typeof date.toDate === 'function') {
      // Timestamp Firestore
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      // Objet Date natif
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      // String ou timestamp
      dateObj = new Date(date);
    } else {
      return 'N/A';
    }
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🔹 NOUVEAU : Obtenir le statut d'un produit pour le contrôle périodique
  const getControleStatus = (dossier, produit) => {
    const isAvailable = isControleAvailable(dossier);
    const status = produit.controlePeriodiqueStatus || 'pending';
    
    if (status === 'completed') return 'completed';
    if (isAvailable) return 'available';
    return 'pending';
  };

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

  const handleAssignToClient = (dossier, product) => {
    setSelectedDossier(dossier);
    setSelectedProduct(product);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    fetchDossiers();
    toast.success("✅ Produit assigné au client avec succès !");
  };

  const getProductControlLink = (product) => {
    const normalized = (product.name || "")
      .toLowerCase()
      .replace(/fit\s+/g, "")
      .replace(/\s+/g, "-");
    return `/revendeur/controle-periodique/${normalized}`;
  };

  const isProductAssigned = (product) => {
    return product.clientEmail && product.clientEmail.trim() !== '';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">
        📂 Mes Dossiers CE
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Chargement en cours...</p>
        </div>
      ) : dossiers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📂</div>
          <p className="text-gray-600 italic text-lg">
            Aucun dossier CE disponible pour l'instant.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dossiers.map((dossier) => (
            <div
              key={dossier.id}
              className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              {/* Header du dossier */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <p className="text-xl font-bold text-blue-800">
                      📄 {dossier.orderName}
                    </p>
                    <div className="space-y-1 mt-2">
                      <p className="text-sm text-gray-600">
                        📅 Créé le : {formatDate(dossier.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        🚚 Livraison : {dossier.deliveryDate || "—"}
                      </p>
                      {/* 🔹 NOUVEAU : Affichage de la date de contrôle périodique */}
                      {dossier.controlePeriodiqueDate && (
                        <p className="text-sm text-orange-600 font-medium">
                          🔔 Contrôle périodique disponible le : {formatDate(dossier.controlePeriodiqueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        dossier.status === "en_attente_remplissage"
                          ? "bg-yellow-200 text-yellow-800"
                          : dossier.status === "validé"
                          ? "bg-green-200 text-green-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {dossier.status}
                    </span>
                    
                    {/* 🔹 NOUVEAU : Badge statut contrôle périodique global */}
                    {isControleAvailable(dossier) ? (
                      <span className="px-3 py-1 text-sm rounded-full font-medium bg-green-100 text-green-800">
                        ✅ Contrôles disponibles
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm rounded-full font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Disponible dans {getDaysRemaining(dossier)} jour{getDaysRemaining(dossier) > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section produits */}
              <div className="p-6">
                {Array.isArray(dossier.produits) && dossier.produits.length > 0 ? (
                  <div className="space-y-4">
                    {dossier.produits.map((p, i) => {
                      const controleStatus = getControleStatus(dossier, p);
                      const daysRemaining = getDaysRemaining(dossier);
                      
                      return (
                        <div
                          key={(p.uuid || p.productId || p.name) + i}
                          className="p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-colors duration-200 space-y-3"
                        >
                          <div className="flex justify-between items-start flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-lg text-gray-800">
                                🛠️ {p.name} — Quantité : {p.quantity || 1}
                              </p>
                              
                              {/* Assignation client */}
                              {isProductAssigned(p) && (
                                <div className="mt-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    👤 Assigné à {p.clientData?.nomEntreprise || p.clientEmail}
                                  </span>
                                </div>
                              )}
                              
                              {/* 🔹 NOUVEAU : Statut contrôle périodique */}
                              <div className="mt-2">
                                {controleStatus === 'completed' ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    ✅ Contrôle périodique effectué
                                  </span>
                                ) : controleStatus === 'available' ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    🔍 Contrôle périodique disponible
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                    ⏳ Contrôle dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              {/* Formulaire CE */}
                              <a
                                href={`/revendeur/orders/${dossier.id}/produits/${
                                  p.uuid ||
                                  p.productId ||
                                  encodeURIComponent(p.name?.toLowerCase() || "")
                                }`}
                                className={`text-sm px-3 py-2 rounded transition-colors ${
                                  p.filled
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-red-600 text-white hover:bg-red-700"
                                }`}
                              >
                                {p.filled
                                  ? "✅ Formulaire rempli"
                                  : "📝 Formulaire à remplir"}
                              </a>

                              {/* 🔹 MODIFIÉ : Bouton contrôle périodique avec logique de disponibilité */}
                              {controleStatus === 'completed' ? (
                                <button
                                  disabled
                                  className="bg-green-600 text-white px-3 py-2 rounded text-sm cursor-default"
                                >
                                  ✅ Contrôle effectué
                                </button>
                              ) : controleStatus === 'available' ? (
                                <a
                                  href={getProductControlLink(p)}
                                  className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
                                >
                                  🔍 Effectuer contrôle périodique
                                </a>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <button
                                    disabled
                                    className="bg-gray-400 text-gray-200 px-3 py-2 rounded text-sm cursor-not-allowed"
                                    title={`Disponible le ${formatDate(dossier.controlePeriodiqueDate)}`}
                                  >
                                    ⏳ Contrôle périodique
                                  </button>
                                  <span className="text-xs text-gray-500 mt-1">
                                    Dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
                                  </span>
                                </div>
                              )}

                              {/* Assignation client */}
                              <button
                                onClick={() => handleAssignToClient(dossier, p)}
                                className={`px-3 py-2 rounded text-sm transition-colors ${
                                  isProductAssigned(p)
                                    ? "bg-orange-600 text-white hover:bg-orange-700"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                                title={isProductAssigned(p) ? "Modifier l'assignation" : "Assigner à un client"}
                              >
                                {isProductAssigned(p) ? "👤 Réassigner" : "👤 Assigner au client"}
                              </button>

                              {/* Documents générés */}
                              {p.documents?.controlePeriodique?.url && (
                                <>
                                  <a
                                    href={p.documents.controlePeriodique.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
                                  >
                                    🔽 Télécharger Contrôle
                                  </a>
                                  <ControlePeriodiquePreview
                                    pdfUrl={p.documents.controlePeriodique.url}
                                  />
                                </>
                              )}

                              {p.documents?.declarationCE?.url && (
                                <a
                                  href={p.documents.declarationCE.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                                >
                                  📄 Décl. CE
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-600 text-lg">
                      ⚠️ Aucun produit associé au dossier.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer du dossier */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm transition-colors"
                  >
                    📘 Notice d'instruction
                  </a>
                  {dossier.status !== "validé" && (
                    <button
                      onClick={() => handleDelete(dossier.id)}
                      className="bg-gray-200 text-red-600 px-4 py-2 rounded hover:bg-gray-300 text-sm transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'assignation client */}
      <AssignProductToClient
        dossier={selectedDossier}
        produit={selectedProduct}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default RevendeurDashboard;