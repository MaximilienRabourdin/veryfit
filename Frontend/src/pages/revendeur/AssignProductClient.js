// components/revendeur/AssignProductToClient.js
import React, { useState } from 'react';
import { doc, updateDoc, collection, query, where, getDocs, addDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

const AssignProductToClient = ({ dossier, produit, isOpen, onClose, onSuccess }) => {
  const [clientData, setClientData] = useState({
    email: '',
    nomEntreprise: '',
    contact: '',
    telephone: '',
    createAccount: true // Coché par défaut
  });
  const [loading, setLoading] = useState(false);
  const [clientExists, setClientExists] = useState(null);
  const [checkingClient, setCheckingClient] = useState(false);

  const handleInputChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset clientExists quand l'email change
    if (field === 'email') {
      setClientExists(null);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const checkIfClientExists = async () => {
    if (!clientData.email) return;
    
    setCheckingClient(true);
    try {
      const usersQuery = query(
        collection(db, 'users_webapp'),
        where('email', '==', clientData.email),
        where('role', '==', 'client')
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        const clientDoc = snapshot.docs[0];
        const existingClient = clientDoc.data();
        setClientExists({
          exists: true,
          data: existingClient,
          id: clientDoc.id
        });
        
        // Pré-remplir les données
        setClientData(prev => ({
          ...prev,
          nomEntreprise: existingClient.nomEntreprise || '',
          contact: existingClient.contact || '',
          telephone: existingClient.telephone || '',
          createAccount: false // Désactiver création si existe déjà
        }));
      } else {
        setClientExists({ exists: false });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du client:', error);
    } finally {
      setCheckingClient(false);
    }
  };

  const handleAssignAndNotify = async () => {
    if (!clientData.email || !clientData.nomEntreprise || !clientData.contact) {
      alert('Veuillez remplir au moins l\'email, le nom de l\'entreprise et le contact');
      return;
    }

    setLoading(true);

    try {
      let clientId = clientExists?.id || null;
      let generatedPassword = null;

      // Créer le compte client si nécessaire et demandé
      if (!clientExists?.exists && clientData.createAccount) {
        generatedPassword = generatePassword();
        
        // Appel API backend pour créer le compte via Firebase Admin
        const API_BASE_URL = window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : 'https://veryfit.onrender.com';

        const createAccountResponse = await fetch(`${API_BASE_URL}/api/create-client-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: clientData.email,
            password: generatedPassword,
            nomEntreprise: clientData.nomEntreprise,
            contact: clientData.contact,
            telephone: clientData.telephone,
            createdBy: auth.currentUser?.email
          })
        });

        if (!createAccountResponse.ok) {
          throw new Error('Erreur lors de la création du compte client');
        }

        const accountResult = await createAccountResponse.json();
        clientId = accountResult.clientId;
      }

      // Mettre à jour le produit avec l'assignation
      const dossierRef = doc(db, 'dossiers', dossier.id);
      const updatedProduits = dossier.produits.map(p => {
        if (p.uuid === produit.uuid) {
          return {
            ...p,
            clientEmail: clientData.email,
            clientAssignedAt: new Date(),
            clientData: {
              nomEntreprise: clientData.nomEntreprise,
              contact: clientData.contact,
              telephone: clientData.telephone
            },
            assignedBy: auth.currentUser?.email
          };
        }
        return p;
      });

      await updateDoc(dossierRef, {
        produits: updatedProduits
      });

      // Notification pour FIT
      await addDoc(collection(db, 'notifications'), {
        type: 'produit_assigne_client',
        dossierId: dossier.id,
        produitId: produit.uuid,
        message: `Équipement "${produit.name}" assigné au client ${clientData.nomEntreprise} (${clientData.email})`,
        clientEmail: clientData.email,
        clientData: {
          nomEntreprise: clientData.nomEntreprise,
          contact: clientData.contact,
          telephone: clientData.telephone
        },
        revendeurEmail: auth.currentUser?.email,
        accountCreated: clientData.createAccount && !clientExists?.exists,
        createdAt: new Date(),
        read: false
      });

      // Envoi email automatique au client
      const API_BASE_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'https://veryfit.onrender.com';

      await fetch(`${API_BASE_URL}/api/send-client-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: clientData.email,
          clientName: clientData.nomEntreprise,
          contactName: clientData.contact,
          produitName: produit.name,
          dossierName: dossier.orderName,
          deliveryDate: dossier.deliveryDate,
          hasAccount: clientData.createAccount && !clientExists?.exists,
          loginCredentials: generatedPassword ? {
            email: clientData.email,
            password: generatedPassword,
            loginUrl: 'https://veryfit.vercel.app'
          } : null,
          noticeUrl: 'https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK'
        })
      });

      const successMessage = clientData.createAccount && !clientExists?.exists
        ? `✅ Équipement assigné avec succès !\n\n📧 ${clientData.nomEntreprise} va recevoir :\n• Email de rappel contrôle périodique\n• Identifiants de connexion générés automatiquement\n• Lien vers la notice d'utilisation\n\n🔐 Compte créé avec mot de passe : ${generatedPassword}`
        : `✅ Équipement assigné avec succès !\n\n📧 ${clientData.nomEntreprise} va recevoir :\n• Email de rappel contrôle périodique\n• Lien vers la notice d'utilisation`;

      alert(successMessage);
      
      onSuccess?.();
      onClose();
      
      // Reset du formulaire
      setClientData({
        email: '',
        nomEntreprise: '',
        contact: '',
        telephone: '',
        createAccount: true
      });
      setClientExists(null);

    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert(`❌ Erreur lors de l\'assignation :\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Assigner à un client final
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Équipement à assigner */}
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-1">Équipement à assigner</h4>
          <p className="text-sm text-blue-700">{produit.name}</p>
          <p className="text-xs text-blue-600">Dossier : {dossier.orderName}</p>
        </div>

        <div className="space-y-4">
          {/* Email du client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email du client final *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={clientData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="client@entreprise.com"
                required
              />
              <button
                onClick={checkIfClientExists}
                disabled={!clientData.email || checkingClient}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
              >
                {checkingClient ? '...' : 'Vérifier'}
              </button>
            </div>
          </div>

          {/* Résultat de la vérification */}
          {clientExists !== null && (
            <div className={`p-3 rounded border ${
              clientExists.exists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              {clientExists.exists ? (
                <div>
                  <p className="text-sm font-medium text-green-800">
                    ✅ Client existant trouvé
                  </p>
                  <p className="text-sm text-green-700">
                    {clientExists.data.nomEntreprise} - {clientExists.data.contact}
                  </p>
                  <p className="text-xs text-green-600">
                    Notification envoyée, pas de nouveau compte créé
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    🆕 Nouveau client détecté
                  </p>
                  <p className="text-xs text-yellow-700">
                    Remplissez les informations ci-dessous
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Formulaire simplifié */}
          <div className="space-y-3">
            <input
              type="text"
              value={clientData.nomEntreprise}
              onChange={(e) => handleInputChange('nomEntreprise', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom de l'entreprise *"
              required
            />
            
            <input
              type="text"
              value={clientData.contact}
              onChange={(e) => handleInputChange('contact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nom du contact principal *"
              required
            />
            
            <input
              type="tel"
              value={clientData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Téléphone"
            />

            {/* Option création compte */}
            {(!clientExists || !clientExists.exists) && (
              <div className="bg-blue-50 p-3 rounded border">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={clientData.createAccount}
                    onChange={(e) => handleInputChange('createAccount', e.target.checked)}
                  />
                  <span className="text-sm font-medium">Créer un compte d'accès à la plateforme</span>
                </label>
                <p className="text-xs text-blue-600 mt-1">
                  Le client recevra des identifiants générés automatiquement
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAssignAndNotify}
              disabled={loading || !clientData.email || !clientData.nomEntreprise || !clientData.contact}
              className={`flex-1 px-4 py-2 rounded text-white transition-colors ${
                loading || !clientData.email || !clientData.nomEntreprise || !clientData.contact
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assignation...
                </span>
              ) : (
                'Assigner et notifier'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignProductToClient;