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
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement de vos équipements...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue sur votre espace FIT DOORS
        </h1>
        <p className="text-blue-100">
          Suivez l'état de vos équipements et accédez à vos rapports de contrôle
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes Équipements</p>
              <p className="text-3xl font-bold text-gray-900">{statistiques.totalEquipements}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">🚚</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rapports Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{statistiques.derniersRapports}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contrôles à Prévoir</p>
              <p className="text-3xl font-bold text-orange-600">{statistiques.alertes}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prochain Contrôle</p>
              <p className="text-sm font-bold text-gray-900">
                {statistiques.prochainControle 
                  ? new Date(statistiques.prochainControle).toLocaleDateString('fr-FR')
                  : 'Aucun prévu'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mes équipements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes Équipements FIT</h2>
            <button 
              onClick={() => navigate('/client/equipements')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir tout →
            </button>
          </div>
        </div>
        <div className="p-6">
          {mesEquipements.length > 0 ? (
            <div className="space-y-4">
              {mesEquipements.slice(0, 3).map((equipement) => (
                <div key={equipement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">FIT</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{equipement.nom}</p>
                      <p className="text-sm text-gray-500">
                        N° de série: {equipement.numeroSerie}
                      </p>
                      <p className="text-sm text-gray-500">
                        Dossier: {equipement.dossierName}
                      </p>
                      {equipement.dateInstallation && (
                        <p className="text-xs text-gray-400">
                          Installé le: {new Date(equipement.dateInstallation).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatutColor(equipement)}`}>
                      {getStatutText(equipement)}
                    </span>
                    {equipement.rapports.declarationCE?.url && (
                      <div className="mt-2">
                        <button 
                          onClick={() => window.open(equipement.rapports.declarationCE.url, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          📄 Voir rapport
                        </button>
                      </div>
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun équipement assigné</h3>
              <p className="text-gray-500 mb-4">
                Aucun équipement FIT n'est encore associé à votre compte.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pour associer vos équipements :</strong><br/>
                  Contactez votre revendeur FIT ou notre service client avec vos références de commande.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/client/equipements')}
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-blue-600 text-xl">🚚</span>
            <div className="text-left">
              <p className="font-medium text-blue-900">Mes équipements</p>
              <p className="text-sm text-blue-600">Détails et historique</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/client/rapports')}
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-green-600 text-xl">📄</span>
            <div className="text-left">
              <p className="font-medium text-green-900">Mes rapports</p>
              <p className="text-sm text-green-600">Contrôles et conformité</p>
            </div>
          </button>
          
          <button 
            onClick={() => window.open('https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK', '_blank')}
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-purple-600 text-xl">📖</span>
            <div className="text-left">
              <p className="font-medium text-purple-900">Notices d'utilisation</p>
              <p className="text-sm text-purple-600">Guides et manuels</p>
            </div>
          </button>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">💡</span>
          <div>
            <h3 className="font-medium text-yellow-800 mb-2">Rappel Important</h3>
            <p className="text-sm text-yellow-700">
              Un contrôle périodique de vos équipements FIT est requis <strong>tous les 6 mois</strong> 
              pour maintenir la validité de votre déclaration de conformité CE et assurer votre sécurité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;