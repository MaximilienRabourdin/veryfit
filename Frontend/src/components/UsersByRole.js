import React, { useEffect, useState } from "react";
import { getUsersByRole } from "../services/usersService";
import VeryfitLoader from "./VeryfitLoader";

const UsersByRole = ({ role }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsersByRole(role);
        setUsers(usersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  if (loading) return <VeryfitLoader />;

  return (
    <div>
      <h2>Utilisateurs pour le rôle : {role}</h2>
      <ul>
        {users.map((user) => (
          <li key={user.uid}>{user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersByRole;
