// pages/client/ClientRapports.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const ClientRapports = () => {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreType, setFiltreType] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [triePar, setTriePar] = useState('date_desc');
  const navigate = useNavigate();

  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchRapports = async () => {
      if (!userEmail) return;

      try {
        const dossiersSnapshot = await getDocs(collection(db, 'dossiers'));
        const rapportsList = [];

        dossiersSnapshot.docs.forEach(doc => {
          const dossier = doc.data();
          if (dossier.produits) {
            dossier.produits.forEach(produit => {
              if (produit.clientEmail === userEmail || 
                  produit.utilisateurFinal?.email === userEmail) {
                
                const equipementInfo = {
                  id: produit.uuid,
                  nom: produit.name,
                  numeroSerie: produit.formulaireData?.porte?.NumeroSerie || 'Non renseigné',
                  dossierName: dossier.orderName,
                  dateInstallation: dossier.deliveryDate,
                  vehicule: produit.formulaireData?.vehicule?.NumeroImmatriculation || 'Non renseigné'
                };

                // Ajouter les différents types de rapports
                if (produit.documents) {
                  // Déclaration CE
                  if (produit.documents.declarationCE?.url) {
                    rapportsList.push({
                      id: `${produit.uuid}-ce`,
                      equipement: equipementInfo,
                      type: 'declaration_ce',
                      titre: 'Déclaration de Conformité CE',
                      description: 'Certification de conformité européenne',
                      url: produit.documents.declarationCE.url,
                      date: produit.documents.declarationCE.timestamp || dossier.createdAt,
                      statut: 'valide',
                      icon: '📋',
                      couleur: 'blue'
                    });
                  }

                  // Déclaration de montage
                  if (produit.documents.declarationMontage?.url) {
                    rapportsList.push({
                      id: `${produit.uuid}-montage`,
                      equipement: equipementInfo,
                      type: 'declaration_montage',
                      titre: 'Rapport de Contrôle de Montage',
                      description: 'Contrôle de l\'installation et mise en service',
                      url: produit.documents.declarationMontage.url,
                      date: produit.documents.declarationMontage.timestamp || produit.formulaireData?.verificateur?.DateVerification,
                      statut: 'valide',
                      icon: '🔧',
                      couleur: 'green'
                    });
                  }

                  // Contrôle périodique
                  if (produit.documents.controlePeriodique?.url) {
                    rapportsList.push({
                      id: `${produit.uuid}-periodique`,
                      equipement: equipementInfo,
                      type: 'controle_periodique',
                      titre: 'Rapport de Contrôle Périodique',
                      description: 'Contrôle de maintenance préventive (6 mois)',
                      url: produit.documents.controlePeriodique.url,
                      date: produit.documents.controlePeriodique.timestamp || produit.controlePeriodiqueData?.dateControle,
                      statut: 'valide',
                      icon: '🔍',
                      couleur: 'purple'
                    });
                  }
                }

                // Vérifier si un contrôle périodique est requis mais non fait
                if (equipementInfo.dateInstallation && !produit.documents?.controlePeriodique?.url) {
                  const installation = new Date(equipementInfo.dateInstallation);
                  const controleRequis = new Date(installation);
                  controleRequis.setMonth(controleRequis.getMonth() + 6);
                  
                  if (new Date() > controleRequis) {
                    rapportsList.push({
                      id: `${produit.uuid}-periodique-requis`,
                      equipement: equipementInfo,
                      type: 'controle_periodique_requis',
                      titre: 'Contrôle Périodique Requis',
                      description: `Contrôle requis depuis le ${controleRequis.toLocaleDateString('fr-FR')}`,
                      url: null,
                      date: controleRequis,
                      statut: 'requis',
                      icon: '⚠️',
                      couleur: 'orange'
                    });
                  }
                }
              }
            });
          }
        });

        setRapports(rapportsList);
      } catch (error) {
        console.error('Erreur lors du chargement des rapports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRapports();
  }, [userEmail]);

  const getTypeLabel = (type) => {
    switch (type) {
      case 'declaration_ce': return 'Déclaration CE';
      case 'declaration_montage': return 'Contrôle de Montage';
      case 'controle_periodique': return 'Contrôle Périodique';
      case 'controle_periodique_requis': return 'Contrôle Requis';
      default: return 'Autre';
    }
  };

  const getStatutInfo = (statut) => {
    switch (statut) {
      case 'valide':
        return { label: 'Valide', color: 'bg-green-100 text-green-800' };
      case 'requis':
        return { label: 'Action requise', color: 'bg-orange-100 text-orange-800' };
      case 'expire':
        return { label: 'Expiré', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const trierRapports = (rapports) => {
    return [...rapports].sort((a, b) => {
      switch (triePar) {
        case 'date_desc':
          return new Date(b.date || 0) - new Date(a.date || 0);
        case 'date_asc':
          return new Date(a.date || 0) - new Date(b.date || 0);
        case 'equipement':
          return a.equipement.nom.localeCompare(b.equipement.nom);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  const rapportsFiltres = trierRapports(
    rapports.filter(rapport => {
      const matchRecherche = rapport.equipement.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                            rapport.equipement.numeroSerie.toLowerCase().includes(recherche.toLowerCase()) ||
                            rapport.titre.toLowerCase().includes(recherche.toLowerCase());
      
      const matchType = filtreType === 'tous' || rapport.type === filtreType;
      
      return matchRecherche && matchType;
    })
  );

  const handleContactRevendeur = () => {
    window.location.href = `mailto:?subject=Demande de contrôle périodique - FIT DOORS&body=Bonjour,%0D%0A%0D%0AJe souhaite organiser un contrôle périodique pour mes équipements FIT DOORS.%0D%0A%0D%0ACordialement`;
  };

  const handleDownloadRapport = (rapport) => {
    if (rapport.url) {
      window.open(rapport.url, '_blank');
    }
  };

  const handleDownloadAll = () => {
    const rapportsDisponibles = rapportsFiltres.filter(r => r.url);
    rapportsDisponibles.forEach(rapport => {
      setTimeout(() => {
        window.open(rapport.url, '_blank');
      }, 100);
    });
  };

  const statistiques = {
    total: rapports.length,
    valides: rapports.filter(r => r.statut === 'valide').length,
    requis: rapports.filter(r => r.statut === 'requis').length,
    declarations: rapports.filter(r => r.type === 'declaration_ce').length,
    controles: rapports.filter(r => r.type.includes('controle')).length
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Chargement de vos rapports...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Rapports</h1>
          <p className="text-gray-600 mt-1">
            {rapports.length} document{rapports.length > 1 ? 's' : ''} disponible{rapports.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          {rapportsFiltres.filter(r => r.url).length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              📥 Télécharger tout
            </button>
          )}
          <button
            onClick={() => navigate('/client/dashboard')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{statistiques.total}</p>
          <p className="text-sm text-gray-600">Total documents</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">{statistiques.valides}</p>
          <p className="text-sm text-gray-600">Rapports valides</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-orange-600">{statistiques.requis}</p>
          <p className="text-sm text-gray-600">Actions requises</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-blue-600">{statistiques.declarations}</p>
          <p className="text-sm text-gray-600">Déclarations CE</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-2xl font-bold text-purple-600">{statistiques.controles}</p>
          <p className="text-sm text-gray-600">Contrôles</p>
        </div>
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
              placeholder="Nom équipement, n° série, titre du rapport..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="tous">Tous les types</option>
              <option value="declaration_ce">Déclarations CE</option>
              <option value="declaration_montage">Contrôles de Montage</option>
              <option value="controle_periodique">Contrôles Périodiques</option>
              <option value="controle_periodique_requis">Contrôles Requis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trier par
            </label>
            <select
              value={triePar}
              onChange={(e) => setTriePar(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date_desc">Date (récent → ancien)</option>
              <option value="date_asc">Date (ancien → récent)</option>
              <option value="equipement">Équipement (A → Z)</option>
              <option value="type">Type de document</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des rapports */}
      {rapportsFiltres.length > 0 ? (
        <div className="space-y-4">
          {rapportsFiltres.map((rapport) => {
            const statutInfo = getStatutInfo(rapport.statut);
            
            return (
              <div key={rapport.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      rapport.couleur === 'blue' ? 'bg-blue-100' :
                      rapport.couleur === 'green' ? 'bg-green-100' :
                      rapport.couleur === 'purple' ? 'bg-purple-100' :
                      rapport.couleur === 'orange' ? 'bg-orange-100' :
                      'bg-gray-100'
                    }`}>
                      <span className="text-xl">{rapport.icon}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{rapport.titre}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statutInfo.color}`}>
                          {statutInfo.label}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{rapport.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>🚚 {rapport.equipement.nom}</span>
                        <span>📍 N° {rapport.equipement.numeroSerie}</span>
                        <span>🏷️ {getTypeLabel(rapport.type)}</span>
                        {rapport.date && (
                          <span>📅 {new Date(rapport.date).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {rapport.url ? (
                      <button
                        onClick={() => handleDownloadRapport(rapport)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        📥 Télécharger
                      </button>
                    ) : rapport.statut === 'requis' ? (
                      <button
                        onClick={handleContactRevendeur}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        📞 Organiser le contrôle
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Non disponible</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {recherche || filtreType !== 'tous' 
              ? 'Aucun rapport trouvé' 
              : 'Aucun rapport disponible'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {recherche || filtreType !== 'tous'
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Vos rapports de contrôle apparaîtront ici une fois les équipements contrôlés.'
            }
          </p>
        </div>
      )}

      {/* Informations importantes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-xl">💡</span>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">À propos de vos rapports</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>📋 Déclaration CE :</strong> Certifie la conformité européenne de votre équipement</p>
              <p><strong>🔧 Contrôle de Montage :</strong> Valide l'installation et la mise en service</p>
              <p><strong>🔍 Contrôle Périodique :</strong> Vérification obligatoire tous les 6 mois</p>
              <p><strong>📖 Notice d'Utilisation :</strong> Toujours accessible et mise à jour</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRapports;