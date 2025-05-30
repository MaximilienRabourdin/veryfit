// pages/client/ClientEquipements.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const ClientEquipements = () => {
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const navigate = useNavigate();

  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchEquipements = async () => {
      if (!userEmail) return;

      try {
        const dossiersSnapshot = await getDocs(collection(db, 'dossiers'));
        const equipementsList = [];

        dossiersSnapshot.docs.forEach(doc => {
          const dossier = doc.data();
          if (dossier.produits) {
            dossier.produits.forEach(produit => {
              if (produit.clientEmail === userEmail || 
                  produit.utilisateurFinal?.email === userEmail) {
                
                const equipement = {
                  id: produit.uuid,
                  dossierId: doc.id,
                  nom: produit.name,
                  numeroSerie: produit.formulaireData?.porte?.NumeroSerie || 'Non renseigné',
                  dateInstallation: dossier.deliveryDate,
                  dateControle: produit.formulaireData?.verificateur?.DateVerification,
                  controlePeriodiqueData: produit.controlePeriodiqueData,
                  dossierName: dossier.orderName,
                  revendeur: dossier.revendeurEmail,
                  
                  // Informations véhicule
                  vehicule: {
                    type: produit.formulaireData?.vehicule?.Type || 'Non renseigné',
                    immatriculation: produit.formulaireData?.vehicule?.NumeroImmatriculation || 'Non renseigné',
                    marque: produit.formulaireData?.vehicule?.MarqueCaisse || 'Non renseigné',
                    numeroIdentification: produit.formulaireData?.vehicule?.NumeroIdentificationCaisse || 'Non renseigné'
                  },
                  
                  // Documents disponibles
                  documents: {
                    declarationCE: produit.documents?.declarationCE || null,
                    declarationMontage: produit.documents?.declarationMontage || null,
                    controlePeriodique: produit.documents?.controlePeriodique || null,
                    noticeUtilisation: produit.documents?.noticeUtilisation || null
                  },
                  
                  // Statut calculé
                  statut: getStatutEquipement(produit, dossier.deliveryDate),
                  prochainControle: calculerProchainControle(produit, dossier.deliveryDate)
                };
                
                equipementsList.push(equipement);
              }
            });
          }
        });

        // Trier par date d'installation (plus récent en premier)
        equipementsList.sort((a, b) => {
          const dateA = new Date(a.dateInstallation || 0);
          const dateB = new Date(b.dateInstallation || 0);
          return dateB - dateA;
        });

        setEquipements(equipementsList);
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipements();
  }, [userEmail]);

  const getStatutEquipement = (produit, dateInstallation) => {
    if (produit.controlePeriodiqueData) {
      return 'controle_periodique_ok';
    } else if (produit.filled && produit.formulaireData) {
      // Vérifier si le contrôle périodique est requis (6 mois après installation)
      const installation = new Date(dateInstallation);
      const controleRequis = new Date(installation);
      controleRequis.setMonth(controleRequis.getMonth() + 6);
      
      if (new Date() > controleRequis) {
        return 'controle_requis';
      }
      return 'controle_initial_ok';
    } else {
      return 'en_attente';
    }
  };

  const calculerProchainControle = (produit, dateInstallation) => {
    if (!dateInstallation) return null;
    
    const installation = new Date(dateInstallation);
    const prochainControle = new Date(installation);
    prochainControle.setMonth(prochainControle.getMonth() + 6);
    
    return prochainControle;
  };

  const getStatutInfo = (statut) => {
    switch (statut) {
      case 'controle_periodique_ok':
        return {
          label: 'Contrôle périodique OK',
          color: 'bg-green-100 text-green-800',
          icon: '✅'
        };
      case 'controle_initial_ok':
        return {
          label: 'Contrôle initial OK',
          color: 'bg-blue-100 text-blue-800',
          icon: '🔵'
        };
      case 'controle_requis':
        return {
          label: 'Contrôle périodique requis',
          color: 'bg-orange-100 text-orange-800',
          icon: '⚠️'
        };
      case 'en_attente':
        return {
          label: 'En attente de contrôle',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '⏳'
        };
      default:
        return {
          label: 'Statut inconnu',
          color: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const equipementsFiltres = equipements.filter(equipement => {
    const matchRecherche = equipement.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                          equipement.numeroSerie.toLowerCase().includes(recherche.toLowerCase()) ||
                          equipement.vehicule.immatriculation.toLowerCase().includes(recherche.toLowerCase());
    
    const matchStatut = filtreStatut === 'tous' || equipement.statut === filtreStatut;
    
    return matchRecherche && matchStatut;
  });

  const handleContactRevendeur = (revendeur) => {
    window.location.href = `mailto:${revendeur}?subject=Demande de contrôle périodique - FIT DOORS`;
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement de vos équipements...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Équipements FIT</h1>
          <p className="text-gray-600 mt-1">
            {equipements.length} équipement{equipements.length > 1 ? 's' : ''} enregistré{equipements.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => navigate('/client/dashboard')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          ← Retour au tableau de bord
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom du produit, n° de série, immatriculation..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par statut
            </label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="controle_periodique_ok">Contrôle périodique OK</option>
              <option value="controle_initial_ok">Contrôle initial OK</option>
              <option value="controle_requis">Contrôle requis</option>
              <option value="en_attente">En attente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des équipements */}
      {equipementsFiltres.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {equipementsFiltres.map((equipement) => {
            const statutInfo = getStatutInfo(equipement.statut);
            
            return (
              <div key={equipement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* En-tête de la carte */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">FIT</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{equipement.nom}</h3>
                        <p className="text-sm text-gray-500">N° {equipement.numeroSerie}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutInfo.color}`}>
                      {statutInfo.icon} {statutInfo.label}
                    </span>
                  </div>
                </div>

                {/* Contenu de la carte */}
                <div className="p-4 space-y-4">
                  {/* Informations véhicule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">🚚 Véhicule</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900">{equipement.vehicule.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Immatriculation:</span>
                        <span className="ml-2 text-gray-900 font-mono">{equipement.vehicule.immatriculation}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Marque:</span>
                        <span className="ml-2 text-gray-900">{equipement.vehicule.marque}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">N° caisse:</span>
                        <span className="ml-2 text-gray-900 font-mono">{equipement.vehicule.numeroIdentification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates importantes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📅 Dates</h4>
                    <div className="space-y-1 text-sm">
                      {equipement.dateInstallation && (
                        <div>
                          <span className="text-gray-500">Installation:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(equipement.dateInstallation).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {equipement.dateControle && (
                        <div>
                          <span className="text-gray-500">Dernier contrôle:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(equipement.dateControle).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {equipement.prochainControle && (
                        <div>
                          <span className="text-gray-500">Prochain contrôle:</span>
                          <span className={`ml-2 font-medium ${
                            new Date(equipement.prochainControle) < new Date() 
                              ? 'text-orange-600' 
                              : 'text-gray-900'
                          }`}>
                            {equipement.prochainControle.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents disponibles */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">📄 Documents</h4>
                    <div className="space-y-2">
                      {equipement.documents.declarationCE?.url && (
                        <button
                          onClick={() => window.open(equipement.documents.declarationCE.url, '_blank')}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          📋 Déclaration de Conformité CE
                        </button>
                      )}
                      {equipement.documents.declarationMontage?.url && (
                        <button
                          onClick={() => window.open(equipement.documents.declarationMontage.url, '_blank')}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          🔧 Rapport de Contrôle de Montage
                        </button>
                      )}
                      {equipement.documents.controlePeriodique?.url && (
                        <button
                          onClick={() => window.open(equipement.documents.controlePeriodique.url, '_blank')}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          🔍 Rapport de Contrôle Périodique
                        </button>
                      )}
                      <button
                        onClick={() => window.open('https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK', '_blank')}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        📖 Notice d'Utilisation
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  {equipement.statut === 'controle_requis' && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm text-orange-800 mb-2">
                          <strong>⚠️ Contrôle périodique requis</strong>
                        </p>
                        <button
                          onClick={() => handleContactRevendeur(equipement.revendeur)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          📞 Contacter le revendeur
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">🚚</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {recherche || filtreStatut !== 'tous' 
              ? 'Aucun équipement trouvé' 
              : 'Aucun équipement assigné'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {recherche || filtreStatut !== 'tous'
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Aucun équipement FIT n\'est encore associé à votre compte.'
            }
          </p>
          
          {!(recherche || filtreStatut !== 'tous') && (
            <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>💡 Pour associer vos équipements :</strong><br/>
                Contactez votre revendeur FIT avec vos références de commande.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientEquipements;