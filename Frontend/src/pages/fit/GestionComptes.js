import React, { useEffect, useState } from "react";
import axios from "axios";
import VeryfitLoader from "../../components/VeryfitLoader";

const GestionDesComptes = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Charger les comptes en attente
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/api/auth/get-unapproved-users");
        setAccounts(response.data.users || []);
      } catch (err) {
        setError("Erreur lors de la récupération des comptes.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Gérer l'approbation ou le rejet d'un compte
  const handleAction = async (uid, action) => {
    const confirmMessage =
      action === "approve"
        ? "Êtes-vous sûr de vouloir approuver ce compte ?"
        : "Êtes-vous sûr de vouloir rejeter ce compte ?";
    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.post("/api/auth/validate-account", { uid, action });
      setAccounts((prev) => prev.filter((account) => account.uid !== uid));
      setSuccessMessage(
        action === "approve"
          ? "Le compte a été approuvé avec succès."
          : "Le compte a été rejeté."
      );
    } catch (err) {
      console.error("Erreur lors de l'action :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  if (loading) return <VeryfitLoader />
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-darkBlue mb-6">Gestion des Comptes</h1>

      {/* Messages de feedback */}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Table des comptes */}
      <div className="bg-white shadow-md rounded p-4">
        {accounts.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Rôle</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.uid} className="border-t">
                  <td className="p-3">{account.email}</td>
                  <td className="p-3 capitalize">{account.role}</td>
                  <td className="p-3 flex gap-4">
                    <button
                      onClick={() => handleAction(account.uid, "approve")}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => handleAction(account.uid, "reject")}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                      Rejeter
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
    </div>
  );
};

export default GestionDesComptes;
