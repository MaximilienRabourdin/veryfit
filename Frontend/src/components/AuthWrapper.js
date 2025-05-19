// src/components/AuthWrapper.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, getIdTokenResult } from "firebase/auth";
import VeryfitLoader from "./VeryfitLoader";

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

      console.log("👤 Utilisateur détecté :", user.email);

      let attempts = 0;
      let claims = null;

      while (attempts < 3) {
        const tokenResult = await getIdTokenResult(user, true); // force refresh
        claims = tokenResult.claims;

        if (claims.role) {
          console.log("✅ Claims récupérés :", claims);
          break;
        }

        console.warn("🔁 Retry claims dans AuthWrapper...");
        await new Promise((res) => setTimeout(res, 1000));
        attempts++;
      }

      if (!claims?.role) {
        console.error("❌ Aucun rôle défini même après retry.");
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

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <VeryfitLoader />;
  return <>{children}</>;
};

export default AuthWrapper;
