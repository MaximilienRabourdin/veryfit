import React, { useEffect, useState } from "react";
import axios from "axios";

const Stats = () => {
  const [stats, setStats] = useState({
    declarationsToValidate: 0,
    declarationsRefused: 0,
    declarationsToDeclare: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    // Récupération des statistiques via l'API
    axios
      .get("https://veryfit-backend.onrender.com")
      .then((response) => setStats(response.data))
      .catch((err) =>
        setError("Erreur lors de la récupération des statistiques.")
      );
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-bold">Déclarations à valider</h2>
        <p className="text-2xl font-bold text-orange-500">
          {stats.declarationsToValidate}
        </p>
      </div>
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-bold">Déclarations refusées</h2>
        <p className="text-2xl font-bold text-red-500">
          {stats.declarationsRefused}
        </p>
      </div>
      <div className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-bold">Commandes à déclarer</h2>
        <p className="text-2xl font-bold text-blue-500">
          {stats.declarationsToDeclare}
        </p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </section>
  );
};

export default Stats;
