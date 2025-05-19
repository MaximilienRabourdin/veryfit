// components/AuthWrapper.js

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
  
      const currentPath = window.location.pathname;
      const isInCreateAccountPage = currentPath.includes("/fit/fit-create-account");
  
      if (!user) {
        console.warn("🚨 Aucun utilisateur détecté.");
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }
  
      let claims;
      for (let i = 0; i < 5; i++) {
        const result = await user.getIdTokenResult(true);
        claims = result.claims;
        if (claims.role) break;
        console.log(`🔁 Retry claims AuthWrapper ${i + 1}/5...`);
        await new Promise(res => setTimeout(res, 1000));
      }
  
      if (!claims.role) {
        console.error("❌ Aucun rôle défini même après retry.");
        if (!isInCreateAccountPage) navigate("/unauthorized", { replace: true });
        return setLoading(false);
      }
  
      if (!claims.isApproved) {
        console.warn("⛔ Utilisateur non approuvé.");
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }
  
      const roleToPath = {
        "Super Admin": "/fit/dashboard",
        "Revendeur": "/revendeur/dashboard",
        "Carrossier": "/carrossier/dashboard",
        "Utilisateur": "/client/dashboard",
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
