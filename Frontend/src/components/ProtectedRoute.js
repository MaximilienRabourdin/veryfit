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
  const [userData, setUserData] = useState(null); // 🔹 AJOUTÉ : Pour stocker toutes les données
  const [checkingClaims, setCheckingClaims] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      if (user) {
        console.log("Utilisateur connecté :", user.uid);
        try {
          const userData = await fetchUserData(user.uid);
          console.log("Données utilisateur récupérées :", userData);
          
          setUserData(userData); // 🔹 AJOUTÉ : Stocker toutes les données
          setRole(userData.role || null);
          
          // 🔹 MODIFIÉ : Logique d'approbation avec support FIT
          const isDirectlyApproved = userData.isApproved === true;
          const isApprovedByFit = userData.createdBy === "FIT";
          const finalApprovalStatus = isDirectlyApproved || isApprovedByFit;
          
          console.log("🔍 Vérification approbation ProtectedRoute:", {
            isDirectlyApproved,
            isApprovedByFit,
            finalApprovalStatus,
            createdBy: userData.createdBy
          });
          
          setIsApproved(finalApprovalStatus);
          
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
  console.log("UserData :", userData); // 🔹 AJOUTÉ : Log des données complètes

  if (loading || checkingClaims) {
    return <VeryfitLoader />;
  }

  if (!user) {
    console.warn("Redirection vers / (pas d'utilisateur connecté)");
    return <Navigate to="/" replace />;
  }

  if (!isApproved) {
    console.warn("Utilisateur non approuvé, redirection vers /unauthorized");
    console.warn("Détail userData:", userData); // 🔹 AJOUTÉ : Debug supplémentaire
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔹 MODIFIÉ : Support des rôles clients et normalisés
  const normalizedRole = role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
  
  // Mapping des rôles pour compatibilité
  const roleMapping = {
    'utilisateur': 'client',
    'client': 'client',
    'revendeur': 'revendeur',
    'carrossier': 'carrossier',
    'super admin': 'fit',
    'fit': 'fit',
    'admin': 'fit'
  };
  
  const mappedRole = roleMapping[normalizedRole] || normalizedRole;
  const mappedAllowedRoles = normalizedAllowedRoles.map(r => roleMapping[r] || r);
  
  console.log("🔍 Vérification rôle:", {
    originalRole: role,
    normalizedRole,
    mappedRole,
    allowedRoles,
    mappedAllowedRoles,
    hasAccess: mappedAllowedRoles.includes(mappedRole)
  });

  if (!mappedAllowedRoles.includes(mappedRole)) {
    console.warn("Rôle non autorisé :", role, "mappé en", mappedRole, ", rôles autorisés :", mappedAllowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("✅ Utilisateur autorisé, affichage des enfants.");
  return <Outlet />;
};

export default ProtectedRoute;