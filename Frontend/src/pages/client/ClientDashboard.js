// pages/client/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const [mesEquipements, setMesEquipements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statistiques, setStatistiques] = useState({
    totalEquipements: 0,
    prochainControle: null,
    derniersRapports: 0,
    alertes: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchClientData = async () => {
      if (!userEmail) return;

      try {
        // Récupérer tous les dossiers et filtrer ceux qui concernent ce client
        const dossiersSnapshot = await getDocs(collection(db, 'dossiers'));
        
        const equipements = [];
        let prochainControle = null;
        let derniersRapports = 0;
        let alertes = 0;

        dossiersSnapshot.docs.forEach(doc => {
          const dossier = doc.data();
          if (dossier.produits) {
            dossier.produits.forEach(produit => {
              // Vérifier si ce produit est assigné à ce client
              if (produit.clientEmail === userEmail || 
                  produit.utilisateurFinal?.email === userEmail) {
                
                const equipement = {
                  id: produit.uuid,
                  dossierId: doc.id,
                  nom: produit.name,
                  numeroSerie: produit.formulaireData?.porte?.NumeroSerie || 'Non renseigné',
                  statut: produit.filled ? 'Contrôlé' : 'En attente',
                  dateControle: produit.formulaireData?.verificateur?.DateVerification,
                  dateInstallation: dossier.deliveryDate,
                  revendeur: dossier.revendeurEmail,
                  rapports: produit.documents || {},
                  type: produit.typeFormulaire,
                  vehicule: produit.formulaireData?.vehicule || {},
                  controlePeriodiqueData: produit.controlePeriodiqueData,
                  dossierName: dossier.orderName
                };
                
                equipements.push(equipement);

                // Calculer statistiques
                if (equipement.dateControle) {
                  derniersRapports++;
                }
                
                // Vérifier si un contrôle approche (6 mois)
                if (equipement.dateInstallation) {
                  const dateInstallation = new Date(equipement.dateInstallation);
                  const prochainDate = new Date(dateInstallation);
                  prochainDate.setMonth(prochainDate.getMonth() + 6);
                  
                  const maintenant = new Date();
                  const joursRestants = Math.ceil((prochainDate - maintenant) / (1000 * 60 * 60 * 24));
                  
                  if (joursRestants <= 30 && joursRestants > 0) {
                    alertes++;
                    if (!prochainControle || prochainDate < new Date(prochainControle)) {
                      prochainControle = prochainDate.toISOString();
                    }
                  }
                }
              }
            });
          }
        });

        // Récupérer les notifications pour ce client
        try {
          const notificationsQuery = query(
            collection(db, 'notifications'),
            where('targetEmail', '==', userEmail),
            orderBy('createdAt', 'desc')
          );
          
          const notificationsSnapshot = await getDocs(notificationsQuery);
          const notifs = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setNotifications(notifs.slice(0, 5));
        } catch (notifError) {
          console.log('Pas de notifications ou erreur index:', notifError);
          setNotifications([]);
        }

        setMesEquipements(equipements);
        setStatistiques({
          totalEquipements: equipements.length,
          prochainControle,
          derniersRapports,
          alertes
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [userEmail]);

  const getStatutColor = (equipement) => {
    if (equipement.controlePeriodiqueData) {
      return 'bg-green-100 text-green-800'; // Contrôle périodique fait
    } else if (equipement.statut === 'Contrôlé') {
      return 'bg-blue-100 text-blue-800'; // Contrôle initial fait
    } else {
      return 'bg-yellow-100 text-yellow-800'; // En attente
    }
  };

  const getStatutText = (equipement) => {
    if (equipement.controlePeriodiqueData) {
      return 'Contrôle périodique OK';
    } else if (equipement.statut === 'Contrôlé') {
      return 'Contrôle initial OK';
    } else {
      return 'En attente de contrôle';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement de vos équipements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal avec padding responsive */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* En-tête de bienvenue - Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-4 sm:p-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
            Bienvenue sur votre espace FIT DOORS
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Suivez l'état de vos équipements et accédez à vos rapports de contrôle
          </p>
        </div>

        {/* Statistiques principales - Grid responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Mes Équipements</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{statistiques.totalEquipements}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-lg flex items-center justify-center self-end sm:self-auto">
                <span className="text-blue-600 text-sm sm:text-lg lg:text-xl">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rapports Disponibles</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{statistiques.derniersRapports}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center self-end sm:self-auto">
                <span className="text-green-600 text-sm sm:text-lg lg:text-xl">📄</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Contrôles à Prévoir</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600">{statistiques.alertes}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-lg flex items-center justify-center self-end sm:self-auto">
                <span className="text-orange-600 text-sm sm:text-lg lg:text-xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Prochain Contrôle</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900">
                  {statistiques.prochainControle 
                    ? new Date(statistiques.prochainControle).toLocaleDateString('fr-FR')
                    : 'Aucun prévu'
                  }
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-lg flex items-center justify-center self-end sm:self-auto">
                <span className="text-purple-600 text-sm sm:text-lg lg:text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mes équipements - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Mes Équipements FIT</h2>
              <button 
                onClick={() => navigate('/client/equipements')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium self-start sm:self-auto"
              >
                Voir tout →
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {mesEquipements.length > 0 ? (
              <div className="space-y-4">
                {mesEquipements.slice(0, 3).map((equipement) => (
                  <div key={equipement.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-xs sm:text-sm">FIT</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{equipement.nom}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          N° de série: {equipement.numeroSerie}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          Dossier: {equipement.dossierName}
                        </p>
                        {equipement.dateInstallation && (
                          <p className="text-xs text-gray-400">
                            Installé le: {new Date(equipement.dateInstallation).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end gap-2">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(equipement)} self-start sm:self-auto`}>
                        {getStatutText(equipement)}
                      </span>
                      {equipement.rapports.declarationCE?.url && (
                        <button 
                          onClick={() => window.open(equipement.rapports.declarationCE.url, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-800 self-start sm:self-auto"
                        >
                          📄 Voir rapport
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {mesEquipements.length > 3 && (
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => navigate('/client/equipements')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Voir les {mesEquipements.length - 3} autres équipements →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-xl sm:text-2xl">🚚</span>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucun équipement assigné</h3>
                <p className="text-gray-500 mb-4 text-sm sm:text-base px-4">
                  Aucun équipement FIT n'est encore associé à votre compte.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mx-auto max-w-md">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Pour associer vos équipements :</strong><br/>
                    Contactez votre revendeur FIT ou notre service client avec vos références de commande.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides - Responsive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/client/equipements')}
              className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <span className="text-blue-600 text-lg sm:text-xl flex-shrink-0">🚚</span>
              <div className="min-w-0">
                <p className="font-medium text-blue-900 text-sm sm:text-base">Mes équipements</p>
                <p className="text-xs sm:text-sm text-blue-600">Détails et historique</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/client/rapports')}
              className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <span className="text-green-600 text-lg sm:text-xl flex-shrink-0">📄</span>
              <div className="min-w-0">
                <p className="font-medium text-green-900 text-sm sm:text-base">Mes rapports</p>
                <p className="text-xs sm:text-sm text-green-600">Contrôles et conformité</p>
              </div>
            </button>
            
            <button 
              onClick={() => window.open('https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK', '_blank')}
              className="flex items-center gap-3 p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left sm:col-span-2 lg:col-span-1"
            >
              <span className="text-purple-600 text-lg sm:text-xl flex-shrink-0">📖</span>
              <div className="min-w-0">
                <p className="font-medium text-purple-900 text-sm sm:text-base">Notices d'utilisation</p>
                <p className="text-xs sm:text-sm text-purple-600">Guides et manuels</p>
              </div>
            </button>
          </div>
        </div>

        {/* Informations importantes - Responsive */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 text-lg sm:text-xl flex-shrink-0">💡</span>
            <div className="min-w-0">
              <h3 className="font-medium text-yellow-800 mb-2 text-sm sm:text-base">Rappel Important</h3>
              <p className="text-xs sm:text-sm text-yellow-700">
                Un contrôle périodique de vos équipements FIT est requis <strong>tous les 6 mois</strong> 
                pour maintenir la validité de votre déclaration de conformité CE et assurer votre sécurité.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;