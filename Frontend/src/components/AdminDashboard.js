import React, { useEffect, useState } from "react";
import { getRole } from "../services/authService";

const AdminDashboard = () => {
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchRole = async () => {
      const userRole = await getRole();
      setRole(userRole);
    };

    fetchRole();
  }, []);

  return (
    <div>
      <h1>Bienvenue dans le tableau de bord</h1>
      {role === "Super Admin" && (
        <div>
          <h2>Fonctionnalités Super Admin</h2>
          <button>Gérer les utilisateurs</button>
          <button>Gérer les commandes</button>
          <button>Gérer les documents</button>
        </div>
      )}
      {role === "Admin" && (
        <div>
          <h2>Fonctionnalités Admin</h2>
          <button>Voir les commandes</button>
          <button>Notifications</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
