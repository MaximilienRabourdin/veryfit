// pages/Login.js
import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import logo from "../medias/logo_fit.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // 🔐 Sécurité : déconnexion auto si un utilisateur est connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !isLoggingIn) {
        console.log("🔄 Utilisateur déjà connecté, déconnexion...");
        await signOut(auth);
      }
    });
    return () => unsubscribe();
  }, [isLoggingIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      console.log("🔄 Tentative de connexion...");
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      console.log("✅ Connexion Firebase réussie");
      
      // Attendre que le token soit prêt
      await user.getIdToken(true);
      const token = await user.getIdTokenResult();
      const { role, isApproved } = token.claims;

      console.log("🔍 DEBUG COMPLET - Connexion:");
      console.log("👤 UID:", user.uid);
      console.log("📧 Email:", user.email);
      console.log("🎯 Rôle détecté:", role);
      console.log("✅ Approuvé:", isApproved);
      console.log("🏷️ Type de isApproved:", typeof isApproved);
      console.log("📋 Tous les claims:", JSON.stringify(token.claims, null, 2));
      console.log("🔍 Comparaison: isApproved === true ?", isApproved === true);
      console.log("🔍 Comparaison: isApproved == true ?", isApproved == true);
      console.log("🔍 Comparaison: Boolean(isApproved) ?", Boolean(isApproved));

      // Si pas de custom claims, utiliser AuthWrapper qui va fallback sur Firestore
      if (!role || isApproved === undefined) {
        console.warn("⚠️ Pas de custom claims détectés, AuthWrapper va gérer via Firestore");
        
        // Stockage des informations de base
        const userId = token.claims.user_id || user.uid;
        localStorage.setItem("userId", userId);
        localStorage.setItem("idToken", token.token);
        
        console.log("✅ Connexion réussie, AuthWrapper va gérer la redirection...");
        // Laisser AuthWrapper gérer tout
        return;
      }

      // Stockage des informations
      const userId = token.claims.user_id || user.uid;
      localStorage.setItem("userId", userId);
      localStorage.setItem("idToken", token.token);

      console.log("✅ Connexion réussie, AuthWrapper va gérer la redirection...");
      
      // Laisser AuthWrapper gérer la redirection
      // setIsLoggingIn restera à true jusqu'à la redirection
      
    } catch (err) {
      console.error("❌ Erreur lors de la connexion :", err);
      setError("Email ou mot de passe incorrect.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex sm:flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo FIT" className="mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-customBlue">
              CONNEXION À LA PLATEFORME
            </h2>
            <p className="text-gray-500 text-center mb-4">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={isLoggingIn}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                disabled={isLoggingIn}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full font-bold bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>

      {/* Visuel droite */}
      <div className="hidden md:flex w-full md:w-1/2 bg-login bg-cover bg-center relative">
        <div className="z-10 text-white p-16 flex justify-start flex-col items-start">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-wide">
            BIENVENUE SUR LA PLATEFORME <br /> DE GESTION FIT DOORS
          </h2>
          <div className="mt-8 w-[8rem] md:w-[10rem] h-[8px] md:h-[10px] bg-red-600"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;