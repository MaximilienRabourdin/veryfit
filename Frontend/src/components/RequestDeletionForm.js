import React, { useState } from "react";
import axios from "axios";

const RequestDeletionForm = () => {
  const [formData, setFormData] = useState({
    requested_by: "",
    target_id: "",
    target_type: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://veryfit-production.up.railway.app/api/deletion-requests",
        formData
      )
      .then((response) => setMessage("Demande envoyée avec succès !"))
      .catch((error) => setMessage("Erreur lors de l'envoi de la demande."));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Demande de suppression</h2>
      {message && <p className="text-green-500">{message}</p>}
      <div className="mb-4">
        <label className="block font-semibold mb-2">ID de l'utilisateur</label>
        <input
          type="text"
          name="requested_by"
          value={formData.requested_by}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">ID de la cible</label>
        <input
          type="text"
          name="target_id"
          value={formData.target_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Type de cible</label>
        <input
          type="text"
          name="target_type"
          value={formData.target_type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-2 py-1"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Soumettre
      </button>
    </form>
  );
};

export default RequestDeletionForm;
