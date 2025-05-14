import React, { useEffect, useState } from "react";
import axios from "axios";
import VeryfitLoader from "../../components/VeryfitLoader";

const FitValidateAccounts = () => {
  const [users, setUsers] = useState([]); // Liste des utilisateurs en attente
  const [loading, setLoading] = useState(true); // Statut du chargement
  const [error, setError] = useState(null); // Gestion des erreurs
  const [successMessage, setSuccessMessage] = useState(""); // Message de succès

  // Charger les utilisateurs non validés
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "https://veryfit-backend.onrender.com/api/auth/unapproved"
      );
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        throw new Error("Erreur lors de la récupération des utilisateurs.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les comptes en attente.");
    } finally {
      setLoading(false);
    }
  };

  // Valider un compte utilisateur
  const handleValidate = async (userId, email) => {
    if (window.confirm("Êtes-vous sûr de vouloir valider ce compte ?")) {
      try {
        await axios.put(
          `https://veryfit-backend.onrender.com/api/auth/validate/${userId}`
        );
        setSuccessMessage(`Le compte ${email} a été validé avec succès !`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la validation du compte.");
      }
    }
  };

  // Charger les utilisateurs lors du montage du composant
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-darkBlue mb-6">
        Validation des Comptes
      </h1>

      {/* Affichage des messages */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <VeryfitLoader/>
      ) : users.length > 0 ? (
        <div className="bg-white shadow-md rounded p-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rôle</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleValidate(user.id, user.email)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Aucun compte en attente de validation.</p>
      )}
    </div>
  );
};

export default FitValidateAccounts;
