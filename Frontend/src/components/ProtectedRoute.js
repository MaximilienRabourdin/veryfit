import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { fetchUserData } from "../services/firestoreService";
import VeryfitLoader from "./VeryfitLoader";

const ProtectedRoute = ({ allowedRoles }) => {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [checkingClaims, setCheckingClaims] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      if (user) {
        console.log("Utilisateur connecté :", user.uid);
        try {
          const userData = await fetchUserData(user.uid);
          console.log("Données utilisateur récupérées :", userData);
          setRole(userData.role || null);
          setIsApproved(userData.isApproved || false);
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur :",
            error
          );
        } finally {
          setCheckingClaims(false);
        }
      } else {
        console.log("Aucun utilisateur connecté.");
        setCheckingClaims(false);
      }
    };

    fetchClaims();
  }, [user]);

  console.log("Statut : loading =", loading, ", checkingClaims =", checkingClaims);
  console.log("Role :", role, ", isApproved :", isApproved);

  if (loading || checkingClaims) {
    return <VeryfitLoader />;
  }

  if (!user) {
    console.warn("Redirection vers / (pas d'utilisateur connecté)");
    return <Navigate to="/" replace />;
  }

  if (!isApproved) {
    console.warn("Utilisateur non approuvé, redirection vers /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(role)) {
    console.warn("Rôle non autorisé :", role, ", redirection vers /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("Utilisateur autorisé, affichage des enfants.");
  return <Outlet />;
};

export default ProtectedRoute;
