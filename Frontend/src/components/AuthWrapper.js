import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, getIdTokenResult, getAuth } from "firebase/auth";

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
  
      if (!user) {
        console.warn("🚨 Aucun utilisateur détecté.");
        if (window.location.pathname !== "/create-account") {
          navigate("/", { replace: true });
        }
        setLoading(false);
        return;
      }
  
      try {
        console.log("👤 Utilisateur détecté :", user.email);
  
        // 🔁 FORCER le rafraîchissement du token pour récupérer les claims à jour
        const refreshedToken = await user.getIdToken(true);
        localStorage.setItem("token", refreshedToken);
  
        const tokenResult = await getIdTokenResult(user);
        const claims = tokenResult.claims;
  
        console.log("📌 Claims Firebase :", claims);
  
        if (!claims.role) {
          console.error("❌ Aucun rôle défini pour cet utilisateur.");
          navigate("/unauthorized", { replace: true });
          setLoading(false);
          return;
        }
  
        if (!claims.isApproved) {
          console.warn("⛔ Utilisateur non approuvé.");
          navigate("/", { replace: true });
          setLoading(false);
          return;
        }
  
        // 🔄 Redirection dynamique selon le rôle
        const roleToPath = {
          "Super Admin": "/fit/dashboard",
          "Revendeur": "/revendeur/dashboard",
          "Carrossier": "/carrossier/dashboard",
          "Utilisateur": "/client/dashboard",
        };
  
        const path = roleToPath[claims.role];
        if (window.location.pathname === "/unauthorized" && path) {
          navigate(path, { replace: true });
        }
  
      } catch (error) {
        console.error("🚨 Erreur lors de la récupération des claims :", error);
        navigate("/unauthorized", { replace: true });
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  if (loading) return <div>Chargement...</div>;
  return <>{children}</>;
};

const checkUserRole = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const token = await user.getIdTokenResult();
  const role = token.claims.role;

  // 🔁 Redirection selon rôle
  switch (role) {
    case "carrossier":
      window.location.href = "/carrossier/dashboard";
      break;
    case "revendeur":
    case "controleur":
      window.location.href = "/revendeur/dashboard";
      break;
    case "utilisateur":
      window.location.href = "/utilisateur/dashboard";
      break;
    case "admin":
    case "Super Admin":
      window.location.href = "/fit/dashboard";
      break;
    default:
      alert("Rôle inconnu. Contactez un administrateur.");
  }
};

export default AuthWrapper;
