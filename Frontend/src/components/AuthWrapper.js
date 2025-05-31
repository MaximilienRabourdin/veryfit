import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import VeryfitLoader from "./VeryfitLoader";

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔄 AuthWrapper - État auth changé:", user ? "connecté" : "déconnecté");
      
      const currentPath = window.location.pathname;
      const isInCreateAccountPage = currentPath.includes("/fit/fit-create-account");
      const isOnHomePage = currentPath === "/";
      const publicPaths = ["/", "/create-account", "/forgot-password", "/reset-password", "/unauthorized", "/confidentialite"];
      const isOnPublicPath = publicPaths.includes(currentPath);

      // Si pas d'utilisateur
      if (!user) {
        console.log("❌ Pas d'utilisateur connecté");
        
        // Si on est déjà sur une page publique, pas besoin de rediriger
        if (isOnPublicPath || isInCreateAccountPage) {
          setLoading(false);
          setAuthChecked(true);
          return;
        }
        
        // Sinon, rediriger vers login
        navigate("/", { replace: true });
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      console.log("✅ Utilisateur connecté:", user.uid);

      // Récupération des claims et rôle
      let claims = null;
      let hasRole = false;
      let userData = null; // 🔹 AJOUTÉ : Pour stocker les données Firestore

      // Tentatives d'obtention des custom claims Firebase
      for (let i = 0; i < 3; i++) {
        try {
          const result = await user.getIdTokenResult(true);
          claims = result.claims || {};
          if (claims.role) {
            hasRole = true;
            console.log("✅ Rôle trouvé:", claims.role);
            break;
          }
        } catch (err) {
          console.error("❌ Erreur claims tentative", i + 1, ":", err);
        }
        if (i < 2) await new Promise((res) => setTimeout(res, 500));
      }

      // Fallback Firestore si claims absents
      if (!hasRole) {
        try {
          console.log("🔄 Fallback Firestore...");
          const userDoc = await getDoc(doc(db, "users_webapp", user.uid));
          if (userDoc.exists()) {
            userData = userDoc.data(); // 🔹 MODIFIÉ : Stocker les données complètes
            claims = {
              role: userData.role,
              isApproved: userData.isApproved === true,
            };
            hasRole = !!userData.role;
            console.log("✅ Rôle Firestore:", userData.role);
            console.log("✅ Données utilisateur:", userData); // 🔹 AJOUTÉ : Log des données
          }
        } catch (err) {
          console.error("❌ Erreur Firestore:", err);
        }
      }

      // Si aucun rôle trouvé
      if (!hasRole) {
        console.warn("❌ Aucun rôle disponible");
        if (!isInCreateAccountPage) {
          navigate("/unauthorized", { replace: true });
        }
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // 🔹 MODIFIÉ : Vérification approbation avec logique FIT
      const isApprovedByFit = userData?.createdBy === "FIT";
      const isDirectlyApproved = claims.isApproved === true;
      const isUserApproved = isDirectlyApproved || isApprovedByFit;

      console.log("🔍 Vérification approbation:", {
        isDirectlyApproved,
        isApprovedByFit,
        isUserApproved,
        createdBy: userData?.createdBy
      });

      if (!isUserApproved) {
        console.warn("⛔ Utilisateur non approuvé");
        if (!isInCreateAccountPage) {
          navigate("/unauthorized", { replace: true });
        }
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // 🔹 MODIFIÉ : Mapping des rôles avec support du rôle "client"
      const roleToBasePath = {
        "Super Admin": "/fit",
        "super admin": "/fit",
        "Revendeur": "/revendeur",
        "revendeur": "/revendeur",
        "Carrossier": "/carrossier",
        "carrossier": "/carrossier",
        "Utilisateur": "/client",
        "utilisateur": "/client",
        "Client": "/client", // 🔹 AJOUTÉ : Support du rôle "client"
        "client": "/client", // 🔹 AJOUTÉ : Support du rôle "client" minuscule
      };

      const roleToDefaultDashboard = {
        "Super Admin": "/fit/dashboard",
        "super admin": "/fit/dashboard",
        "Revendeur": "/revendeur/dashboard",
        "revendeur": "/revendeur/dashboard",
        "Carrossier": "/carrossier/dashboard",
        "carrossier": "/carrossier/dashboard",
        "Utilisateur": "/client/dashboard",
        "utilisateur": "/client/dashboard",
        "Client": "/client/dashboard", // 🔹 AJOUTÉ : Support du rôle "client"
        "client": "/client/dashboard", // 🔹 AJOUTÉ : Support du rôle "client" minuscule
      };

      const userBasePath = roleToBasePath[claims.role];
      const userDefaultDashboard = roleToDefaultDashboard[claims.role];
      
      // Vérifier si l'utilisateur est sur une page autorisée
      const isOnAuthorizedPath = userBasePath && currentPath.startsWith(userBasePath);
      
      console.log("📍 currentPath:", currentPath);
      console.log("🎯 userBasePath:", userBasePath);
      console.log("✅ isOnAuthorizedPath:", isOnAuthorizedPath);
      console.log("👤 Rôle utilisateur:", claims.role);

      // Logique de redirection
      if (!userBasePath) {
        console.error("❌ Rôle non mappé:", claims.role);
        navigate("/unauthorized", { replace: true });
      } else if (isOnHomePage || (!isOnAuthorizedPath && !isInCreateAccountPage)) {
        console.log("➡️ Redirection vers:", userDefaultDashboard);
        navigate(userDefaultDashboard, { replace: true });
      } else {
        console.log("✅ Utilisateur sur la bonne page, pas de redirection");
      }

      setLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading || !authChecked) {
    return <VeryfitLoader />;
  }

  return <>{children}</>;
};

export default AuthWrapper;