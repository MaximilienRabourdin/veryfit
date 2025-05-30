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
      const response = await fetch("https://veryfit.onrender.com/api/custom-claims/setCustomClaims", {
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

      // Préparer les données selon le rôle
      const baseUserData = {
        email,
        role: role.toLowerCase(),
        isApproved: true,
        createdAt: new Date(),
        createdBy: auth.currentUser?.email || 'fit@fitdoors.com'
      };

      let userData;

      if (role.toLowerCase() === 'client') {
        // Données spécifiques aux clients
        userData = {
          ...baseUserData,
          nomEntreprise: nomEntreprise || email.split('@')[0],
          contact: `${Prenom} ${Nom}`.trim() || Contact,
          adresse: `${adresse}, ${CodePostal} ${ville}`.trim(),
          ville,
          codePostal: CodePostal,
          telephone: Telephone,
          secteurActivite,
          commentaires,
          preferences: {
            notifications: true,
            rappelsEmail: true,
            langue: 'fr'
          }
        };
      } else {
        // Données pour revendeurs et carrossiers (format existant)
        userData = {
          ...baseUserData,
          Nom: Nom || nomEntreprise, // Utiliser nomEntreprise si Nom est vide
          Prenom,
          Numero,
          NumeroAdherent,
          CodePostal,
          CodeVendeur,
          Contact: Contact || `${Prenom} ${Nom}`.trim(),
          Pays,
          CodePaysRegion,
          Telephone,
          // Champs additionnels pour compatibilité
          company: nomEntreprise || `${Prenom} ${Nom}`.trim(),
          adresse
        };
      }

      await setDoc(doc(db, "users_webapp", user.uid), userData);

      await setCustomClaims(user.uid, role.toLowerCase());

      // Créer une notification
      await addDoc(collection(db, 'notifications'), {
        type: `nouveau_${role.toLowerCase()}`,
        message: `🆕 Nouveau ${getRoleDisplayName(role)} créé : ${nomEntreprise || `${Prenom} ${Nom}` || email} (${email})`,
        createdAt: new Date(),
        createdBy: auth.currentUser?.email || 'fit@fitdoors.com',
        userId: user.uid,
        read: false
      });

      // ✅ Patch : force la reconnexion pour recharger les claims
      await signOut(auth);
      await new Promise((res) => setTimeout(res, 500));
      const reauth = await signInWithEmailAndPassword(auth, email, password);
      console.log("🔁 Reconnecté pour recharger la session :", reauth.user.uid);

      setMessage(`✅ Compte ${getRoleDisplayName(role)} créé avec succès !\n\nEmail : ${email}\nMot de passe : ${password}\n\nL'utilisateur peut maintenant se connecter.`);
      
      // Reset du formulaire
      setFormData({
        email: "", password: "", role: "", Nom: "", Prenom: "",
        Numero: "", NumeroAdherent: "", CodePostal: "",
        CodeVendeur: "", Contact: "", Pays: "France", CodePaysRegion: "", Telephone: "",
        nomEntreprise: "", adresse: "", ville: "", secteurActivite: "", commentaires: ""
      });

    } catch (err) {
      console.error("❌ Erreur :", err.message);
      setError(err.message);
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Identifiants du compte</h2>
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
              <option value="Revendeur">Revendeur</option>
              <option value="Carrossier">Carrossier</option>
              <option value="Client">Client (Utilisateur final)</option>
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
          {loading ? "Création en cours..." : `Créer le compte ${getRoleDisplayName(formData.role)}`}
        </button>

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 whitespace-pre-line">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Aide contextuelle */}
        {formData.role && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              💡 À propos du rôle {getRoleDisplayName(formData.role)}
            </h4>
            <div className="text-sm text-blue-700">
              {isClientRole ? (
                <p>Les clients peuvent consulter leurs équipements, accéder aux rapports de contrôle et recevoir des notifications de maintenance.</p>
              ) : formData.role.toLowerCase() === 'revendeur' ? (
                <p>Les revendeurs effectuent les contrôles périodiques et peuvent gérer les rappels de maintenance.</p>
              ) : (
                <p>Les carrossiers effectuent les contrôles de montage et mise en service des équipements.</p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default FitCreateAccount;