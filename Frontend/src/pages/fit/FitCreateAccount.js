import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

const FitCreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "", password: "", role: "",
    Nom: "", Prenom: "", Numero: "", NumeroAdherent: "",
    CodePostal: "", CodeVendeur: "", Contact: "",
    Pays: "France", CodePaysRegion: "", Telephone: "",
    
    // Champs spécifiques aux clients
    nomEntreprise: "",
    adresse: "",
    ville: "",
    secteurActivite: "",
    commentaires: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secteursActivite = [
    'Transport routier',
    'Logistique',
    'Distribution',
    'E-commerce',
    'Agroalimentaire',
    'BTP',
    'Déménagement',
    'Location de véhicules',
    'Autre'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setCustomClaims = async (uid, role) => {
    try {
      // 🔹 MODIFIÉ : URL mise à jour selon votre backend
      const API_URL = process.env.NODE_ENV === 'production' 
        ? "https://veryfit-production.up.railway.app" 
        : "http://localhost:5000";
        
      const response = await fetch(`${API_URL}/api/custom-claims/setCustomClaims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, role: role.toLowerCase(), isApproved: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erreur lors de la mise à jour des claims.");
      console.log("✅ Claims appliqués côté backend");
    } catch (error) {
      console.error("❌ Erreur lors de l'appel à setCustomClaims:", error.message);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role.toLowerCase()) {
      case 'revendeur': return 'Revendeur';
      case 'carrossier': return 'Carrossier';
      case 'client': return 'Client (Utilisateur final)';
      default: return role;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const {
      email, password, role, Nom, Prenom,
      Numero, NumeroAdherent, CodePostal,
      CodeVendeur, Contact, Pays,
      CodePaysRegion, Telephone,
      nomEntreprise, adresse, ville, secteurActivite, commentaires
    } = formData;

    try {
      const existing = await fetchSignInMethodsForEmail(auth, email);
      if (existing.length > 0) throw new Error("Email déjà utilisé.");

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Utilisateur créé :", user.uid);

      // 🔹 MODIFIÉ : Données de base avec indicateur FIT
      const baseUserData = {
        email,
        role: role.toLowerCase(),
        isApproved: true, // ✅ Approuvé automatiquement par FIT
        createdAt: new Date(),
        createdBy: "FIT", // 🔹 IMPORTANT : Marquer comme créé par FIT
        approvedAt: new Date(), // 🔹 AJOUTÉ : Date d'approbation
        approvedBy: auth.currentUser?.email || 'fit@fitdoors.com' // 🔹 AJOUTÉ : Qui a approuvé
      };

      let userData;

      if (role.toLowerCase() === 'client') {
        // 🔹 MODIFIÉ : Données spécifiques aux clients avec structure cohérente
        userData = {
          ...baseUserData,
          nom: Contact || `${Prenom} ${Nom}`.trim(), // Nom de contact pour compatibilité
          company: nomEntreprise || email.split('@')[0], // Nom d'entreprise pour compatibilité
          nomEntreprise: nomEntreprise || email.split('@')[0],
          contact: Contact || `${Prenom} ${Nom}`.trim(),
          adresse: adresse ? `${adresse}, ${CodePostal} ${ville}`.trim() : '',
          ville: ville || '',
          codePostal: CodePostal || '',
          telephone: Telephone || '',
          secteurActivite: secteurActivite || '',
          commentaires: commentaires || '',
          preferences: {
            notifications: true,
            rappelsEmail: true,
            langue: 'fr'
          },
          // 🔹 AJOUTÉ : Champs pour compatibilité avec les autres composants
          Nom: nomEntreprise, // Pour certains composants qui utilisent ce champ
          Contact: Contact,
          Telephone: Telephone
        };
      } else {
        // Données pour revendeurs et carrossiers (format existant)
        userData = {
          ...baseUserData,
          Nom: Nom || nomEntreprise,
          Prenom: Prenom || '',
          Numero: Numero || '',
          NumeroAdherent: NumeroAdherent || '',
          CodePostal: CodePostal || '',
          CodeVendeur: CodeVendeur || '',
          Contact: Contact || `${Prenom} ${Nom}`.trim(),
          Pays: Pays || 'France',
          CodePaysRegion: CodePaysRegion || '',
          Telephone: Telephone || '',
          // Champs additionnels pour compatibilité
          company: nomEntreprise || `${Prenom} ${Nom}`.trim(),
          nom: `${Prenom} ${Nom}`.trim(), // Pour compatibilité
          adresse: adresse || ''
        };
      }

      console.log("📝 Données utilisateur à sauvegarder:", userData);

      await setDoc(doc(db, "users_webapp", user.uid), userData);
      console.log("✅ Données sauvegardées dans Firestore");

      await setCustomClaims(user.uid, role.toLowerCase());

      // Créer une notification
      await addDoc(collection(db, 'notifications'), {
        type: `nouveau_${role.toLowerCase()}`,
        message: `🆕 Nouveau ${getRoleDisplayName(role)} créé : ${nomEntreprise || Contact || `${Prenom} ${Nom}` || email} (${email})`,
        createdAt: new Date(),
        createdBy: auth.currentUser?.email || 'fit@fitdoors.com',
        userId: user.uid,
        read: false
      });

      // 🔹 MODIFIÉ : Message de succès plus informatif
      const successMsg = `✅ Compte ${getRoleDisplayName(role)} créé avec succès !

📧 Email : ${email}
🔑 Mot de passe : ${password}
🏢 ${role.toLowerCase() === 'client' ? 'Entreprise' : 'Société'} : ${nomEntreprise || Contact || `${Prenom} ${Nom}`}

✅ Le compte est automatiquement approuvé
✅ L'utilisateur peut se connecter immédiatement
✅ Redirection automatique vers son tableau de bord

📧 Un email de bienvenue sera envoyé avec les informations de connexion.`;

      setMessage(successMsg);
      
      // Reset du formulaire
      setFormData({
        email: "", password: "", role: "", Nom: "", Prenom: "",
        Numero: "", NumeroAdherent: "", CodePostal: "",
        CodeVendeur: "", Contact: "", Pays: "France", CodePaysRegion: "", Telephone: "",
        nomEntreprise: "", adresse: "", ville: "", secteurActivite: "", commentaires: ""
      });

      console.log("🎉 Compte créé avec succès pour:", email, "avec le rôle:", role);

    } catch (err) {
      console.error("❌ Erreur création compte:", err.message);
      
      // 🔹 MODIFIÉ : Messages d'erreur plus explicites
      let errorMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Adresse email invalide";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Le mot de passe doit contenir au moins 6 caractères";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isClientRole = formData.role.toLowerCase() === 'client';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold uppercase my-6 text-blue-950 text-center">
        Créer un compte utilisateur
      </h1>
      
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-full max-w-4xl space-y-6">
        {/* Section identifiants */}
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔐 Identifiants du compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              name="email" 
              type="email" 
              placeholder="Email*" 
              value={formData.email} 
              onChange={handleChange} 
              className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
            />
            <input 
              name="password" 
              type="password" 
              placeholder="Mot de passe*" 
              value={formData.password} 
              onChange={handleChange} 
              className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required 
              minLength="6"
            />
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              required
            >
              <option value="">Choisir un rôle*</option>
              <option value="Revendeur">🏪 Revendeur</option>
              <option value="Carrossier">🔧 Carrossier</option>
              <option value="Client">👤 Client (Utilisateur final)</option>
            </select>
          </div>
        </div>

        {/* Section informations selon le rôle */}
        {formData.role && (
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {isClientRole ? '🏢 Informations entreprise' : '👤 Informations personnelles'}
            </h2>
            
            {isClientRole ? (
              // Formulaire client simplifié
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="nomEntreprise" 
                  placeholder="Nom de l'entreprise*" 
                  value={formData.nomEntreprise} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
                <input 
                  name="Contact" 
                  placeholder="Nom du contact principal*" 
                  value={formData.Contact} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
                <input 
                  name="Telephone" 
                  placeholder="Téléphone*" 
                  value={formData.Telephone} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
                <select 
                  name="secteurActivite" 
                  value={formData.secteurActivite} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Secteur d'activité</option>
                  {secteursActivite.map(secteur => (
                    <option key={secteur} value={secteur}>{secteur}</option>
                  ))}
                </select>
                <input 
                  name="adresse" 
                  placeholder="Adresse" 
                  value={formData.adresse} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    name="CodePostal" 
                    placeholder="Code postal" 
                    value={formData.CodePostal} 
                    onChange={handleChange} 
                    className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                  <input 
                    name="ville" 
                    placeholder="Ville" 
                    value={formData.ville} 
                    onChange={handleChange} 
                    className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
            ) : (
              // Formulaire revendeur/carrossier (format existant)
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="Nom" 
                  placeholder="Nom*" 
                  value={formData.Nom} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
                <input 
                  name="Prenom" 
                  placeholder="Prénom" 
                  value={formData.Prenom} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <input 
                  name="Contact" 
                  placeholder="Contact" 
                  value={formData.Contact} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <input 
                  name="Telephone" 
                  placeholder="Téléphone" 
                  value={formData.Telephone} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <input 
                  name="nomEntreprise" 
                  placeholder="Nom de l'entreprise" 
                  value={formData.nomEntreprise} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <input 
                  name="adresse" 
                  placeholder="Adresse" 
                  value={formData.adresse} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            )}
          </div>
        )}

        {/* Section informations complémentaires (pour revendeurs/carrossiers) */}
        {formData.role && !isClientRole && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Informations complémentaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Numero", "NumeroAdherent", "CodePostal", "CodeVendeur", "Pays", "CodePaysRegion"].map((field) => (
                <input 
                  key={field} 
                  name={field} 
                  placeholder={field.replace(/([A-Z])/g, ' $1').trim()} 
                  value={formData[field]} 
                  onChange={handleChange} 
                  className="border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              ))}
            </div>
          </div>
        )}

        {/* Section commentaires pour clients */}
        {isClientRole && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">💬 Informations complémentaires</h2>
            <textarea 
              name="commentaires" 
              placeholder="Commentaires ou informations particulières..." 
              value={formData.commentaires} 
              onChange={handleChange} 
              rows="3"
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed" 
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
              Création en cours...
            </>
          ) : (
            `✅ Créer le compte ${getRoleDisplayName(formData.role)}`
          )}
        </button>

        {/* 🔹 MODIFIÉ : Message de succès amélioré */}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-green-800 mb-3">Compte créé avec succès !</h3>
                <pre className="text-sm text-green-800 whitespace-pre-line font-mono bg-green-100 p-3 rounded">{message}</pre>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 🔹 MODIFIÉ : Aide contextuelle améliorée */}
        {formData.role && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              💡 À propos du rôle {getRoleDisplayName(formData.role)}
            </h4>
            <div className="text-sm text-blue-700">
              {isClientRole ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Accès au tableau de bord client</li>
                  <li>Consultation des équipements assignés</li>
                  <li>Téléchargement des rapports de contrôle</li>
                  <li>Notifications de maintenance automatiques</li>
                  <li>Accès aux notices d'utilisation</li>
                </ul>
              ) : formData.role.toLowerCase() === 'revendeur' ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Effectue les contrôles périodiques (6 mois)</li>
                  <li>Génère les certificats de contrôle</li>
                  <li>Gère les rappels de maintenance</li>
                  <li>Assigne les équipements aux clients</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>Effectue les contrôles de montage et mise en service</li>
                  <li>Remplit les formulaires de conformité CE</li>
                  <li>Génère les déclarations de montage</li>
                  <li>Validation des installations</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 🔹 NOUVEAU : Information importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-lg">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                <strong>Comptes créés par FIT :</strong> Les comptes sont automatiquement approuvés et l'utilisateur peut se connecter immédiatement sans validation supplémentaire.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FitCreateAccount;