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
      const isOnHomePage = currentPath === "/";

      if (!user) {
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }

      let claims = null;
      let hasRole = false;

      for (let i = 0; i < 5; i++) {
        try {
          const result = await user.getIdTokenResult(true);
          claims = result.claims || {};
          if (claims.role) {
            hasRole = true;
            break;
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des claims:", err);
        }
        await new Promise(res => setTimeout(res, 1000));
      }

      if (!hasRole) {
        try {
          const userDocRef = doc(db, "users_webapp", user.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            if (userData.role) {
              claims = {
                role: userData.role,
                isApproved: userData.isApproved === true
              };
              hasRole = true;
            }
          }
        } catch (error) {
          console.error("Erreur Firestore:", error);
        }
      }

      if (!hasRole) {
        if (!isInCreateAccountPage) navigate("/unauthorized", { replace: true });
        return setLoading(false);
      }

      if (claims.isApproved !== true) {
        if (!isInCreateAccountPage) navigate("/", { replace: true });
        return setLoading(false);
      }

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

      if (path && !isInCreateAccountPage && !isOnHomePage) {
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
