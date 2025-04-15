import React, { useEffect, useState } from "react";
import axios from "axios";

const LogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Récupère les logs depuis l'API
    axios
      .get("http://veryfit-production.up.railway.app/api/logs")
      .then((response) => setLogs(response.data))
      .catch((err) => setError("Erreur lors de la récupération des logs."));
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Historique des actions</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Utilisateur</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
            <th className="border border-gray-300 px-4 py-2">Cible</th>
            <th className="border border-gray-300 px-4 py-2">Type de cible</th>
            <th className="border border-gray-300 px-4 py-2">Horodatage</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="border border-gray-300 px-4 py-2">
                {log.user_id}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {log.action_type}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {log.target_id}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {log.target_type}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
