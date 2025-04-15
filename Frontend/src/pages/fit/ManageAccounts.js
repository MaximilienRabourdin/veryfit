import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ManageAccounts = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [validatedAccounts, setValidatedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // Chargement individuel
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // 🔹 Récupérer tous les comptes
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const pendingResponse = await axios.get("http://localhost:5000/api/auth/get-unapproved-users");
      const validatedResponse = await axios.get("http://localhost:5000/api/auth/get-approved-users");
  
      console.log("Comptes en attente :", pendingResponse.data.users);
      console.log("Comptes validés :", validatedResponse.data.users);
  
      setPendingAccounts(pendingResponse.data.users || []);
      setValidatedAccounts(validatedResponse.data.users || []);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des comptes :", err);
      setError("Erreur réseau ou serveur. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🔹 Fonction pour valider un compte
  const handleValidateAccount = async (uid) => {
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      const response = await axios.post("http://localhost:5000/api/auth/validate-account", { uid });
      if (response.data.success) {
        setSuccessMessage("Compte validé avec succès !");
        setPendingAccounts((prev) => prev.filter((account) => account.uid !== uid));
        setValidatedAccounts((prev) => [
          ...prev,
          pendingAccounts.find((account) => account.uid === uid),
        ]);
      }
    } catch (err) {
      console.error("Erreur lors de la validation :", err);
      setError("Erreur lors de la validation. Veuillez réessayer.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  // 🔹 Fonction pour supprimer un compte
  const handleDeleteAccount = async (uid) => {
    setActionLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      const response = await axios.delete(`http://localhost:5000/api/auth/delete-account/${uid}`);
      if (response.data.success) {
        setSuccessMessage("Compte supprimé avec succès !");
        setValidatedAccounts((prev) => prev.filter((account) => account.uid !== uid));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      setError("Erreur lors de la suppression. Veuillez réessayer.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  // 🔹 Filtrer les comptes validés
  const filteredValidatedAccounts = validatedAccounts.filter(
    (account) =>
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.company && account.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-lightGray min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-darkBlue">Gestion des comptes</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/create-account")}
        >
         + Créer un compte
        </button>
      </div>

      {/* Notifications */}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Section des comptes en attente de validation */}
      <div className="bg-white shadow-md p-4 rounded mb-6">
        <h2 className="text-xl font-bold mb-4">Comptes en attente de validation</h2>
        {loading ? (
          <p>Chargement des comptes...</p>
        ) : pendingAccounts.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Rôle</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingAccounts.map((account) => (
                <tr key={account.uid} className="border-t hover:bg-gray-100">
                  <td className="p-2">{account.email}</td>
                  <td className="p-2">{account.role}</td>
                  <td className="p-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      onClick={() => handleValidateAccount(account.uid)}
                      disabled={actionLoading[account.uid]}
                    >
                      {actionLoading[account.uid] ? "Validation..." : "Valider"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucun compte en attente de validation.</p>
        )}
      </div>

      {/* Section des comptes validés */}
      <div className="bg-white shadow-md p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Comptes validés</h2>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par email ou entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        {loading ? (
          <p>Chargement des comptes validés...</p>
        ) : filteredValidatedAccounts.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Rôle</th>
                <th className="p-2 text-left">Entreprise</th>
                <th className="p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredValidatedAccounts.map((account) => (
                <tr key={account.uid} className="border-t hover:bg-gray-100">
                  <td className="p-2">{account.email}</td>
                  <td className="p-2">{account.role}</td>
                  <td className="p-2">{account.company || "Non renseignée"}</td>
                  <td className="p-2">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      onClick={() => handleDeleteAccount(account.uid)}
                      disabled={actionLoading[account.uid]}
                    >
                      {actionLoading[account.uid] ? "Suppression..." : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Aucun compte validé trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default ManageAccounts;
