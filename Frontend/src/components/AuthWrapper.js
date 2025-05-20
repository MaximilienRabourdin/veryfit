// components/AuthWrapper.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import VeryfitLoader from "./VeryfitLoader";

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
  
      const currentPath = window.location.pathname;
      const isInCreateAccountPage = currentPath.includes("/fit/fit-create-account");
  
      if (!user) {
        console.warn("🚨 Aucun utilisateur détecté.");
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }
  
      // Étape 1: Essayer d'obtenir les claims Firebase (avec retries)
      let claims = null;
      let hasRole = false;
      
      for (let i = 0; i < 5; i++) {
        const result = await user.getIdTokenResult(true);
        claims = result.claims;
        if (claims.role) {
          hasRole = true;
          break;
        }
        console.log(`🔁 Retry claims AuthWrapper ${i + 1}/5...`);
        await new Promise(res => setTimeout(res, 1000));
      }
  
      // Étape 2: Si pas de rôle dans les claims, vérifier dans Firestore
      if (!hasRole) {
        console.log("🔍 Pas de rôle dans les claims, vérification dans Firestore...");
        try {
          const userDocRef = doc(db, "users_webapp", user.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            
            if (userData.role) {
              console.log("✅ Rôle trouvé dans Firestore:", userData.role);
              
              // Utiliser les données de Firestore comme si c'était des claims
              claims = {
                ...claims,
                role: userData.role,
                isApproved: userData.isApproved || false
              };
              
              hasRole = true;
            }
          }
        } catch (error) {
          console.error("❌ Erreur lors de la récupération des données Firestore:", error);
        }
      }
  
      // Si toujours pas de rôle après les deux vérifications
      if (!hasRole) {
        console.error("❌ Aucun rôle défini même après vérification Firestore.");
        if (!isInCreateAccountPage) navigate("/unauthorized", { replace: true });
        return setLoading(false);
      }
  
      // Vérifier si l'utilisateur est approuvé
      if (!claims.isApproved) {
        console.warn("⛔ Utilisateur non approuvé.");
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }
  
      // Redirection en fonction du rôle
      const roleToPath = {
        "Super Admin": "/fit/dashboard",
        "super admin": "/fit/dashboard",
        "Revendeur": "/revendeur/dashboard",
        "revendeur": "/revendeur/dashboard",
        "Carrossier": "/carrossier/dashboard",
        "carrossier": "/carrossier/dashboard",
        "Utilisateur": "/client/dashboard",
        "utilisateur": "/client/dashboard",
      };
  
      const path = roleToPath[claims.role];
      if (path && !isInCreateAccountPage) {
        navigate(path, { replace: true });
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  if (loading) return <VeryfitLoader />;
  return <>{children}</>;
};

export default AuthWrapper;