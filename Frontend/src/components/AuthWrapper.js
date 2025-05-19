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
        navigate("/", { replace: true });
        setLoading(false);
        return;
      }

      try {
        console.log("👤 Utilisateur détecté :", user.email);

        let claims;
        for (let i = 0; i < 5; i++) {
          const result = await getIdTokenResult(user, true);
          claims = result.claims;
          if (claims.role) {
            console.log(`✅ Claims récupérés (tentative ${i + 1}) :`, claims);
            break;
          }
          console.log(`🔄 Claims non disponibles (tentative ${i + 1}), retry...`);
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (!claims || !claims.role) {
          console.error("❌ Aucun rôle défini même après retry.");
          navigate("/unauthorized", { replace: true });
          return;
        }

        if (!claims.isApproved) {
          console.warn("⛔ Utilisateur non approuvé.");
          navigate("/", { replace: true });
          return;
        }

        const redirectMap = {
          "Super Admin": "/fit/dashboard",
          "admin": "/fit/dashboard",
          "revendeur": "/revendeur/dashboard",
          "carrossier": "/carrossier/dashboard",
          "utilisateur": "/client/dashboard",
        };

        const destination = redirectMap[claims.role.toLowerCase()];
        if (destination && location.pathname === "/unauthorized") {
          navigate(destination, { replace: true });
        }
      } catch (error) {
        console.error("🚨 Erreur lors de la récupération des claims :", error);
        navigate("/unauthorized", { replace: true });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <VeryfitLoader />;
  return <>{children}</>;
};

export default AuthWrapper;
