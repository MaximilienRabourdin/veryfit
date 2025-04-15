import React, { useEffect, useState } from "react";
import { fetchOrders, deleteOrder } from "../../services/ordersService";

const CommandesList = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // État pour le terme de recherche
  const [statusFilter, setStatusFilter] = useState(""); // État pour le filtre sur le statut
  const [revendeurFilter, setRevendeurFilter] = useState(""); // État pour le filtre sur le revendeur
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // Commande sélectionnée pour les détails
  const [showDetailsPopup, setShowDetailsPopup] = useState(false); // État de la popup

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await fetchOrders();
        setOrders(ordersData);
        setFilteredOrders(ordersData); // Initialisation des filtres
      } catch (err) {
        setError("Impossible de charger les commandes.");
      }
    };

    loadOrders();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterOrders(term, statusFilter, revendeurFilter);
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    filterOrders(searchTerm, status, revendeurFilter);
  };

  const handleRevendeurFilterChange = (e) => {
    const revendeur = e.target.value;
    setRevendeurFilter(revendeur);
    filterOrders(searchTerm, statusFilter, revendeur);
  };

  const filterOrders = (term, status, revendeur) => {
    const filtered = orders.filter(
      (order) =>
        (!term ||
          order.orderName.toLowerCase().includes(term) ||
          order.revendeur.toLowerCase().includes(term)) &&
        (!status || order.status === status) &&
        (!revendeur || order.revendeur === revendeur)
    );
    setFilteredOrders(filtered);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette commande ?"
    );
    if (confirmed) {
      try {
        await deleteOrder(id);
        setOrders((prev) => prev.filter((order) => order.id !== id));
        setFilteredOrders((prev) => prev.filter((order) => order.id !== id));
      } catch (err) {
        setError("Erreur lors de la suppression de la commande.");
        console.error("Erreur lors de la suppression :", err);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsPopup(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Liste des Commandes
      </h1>

      {/* Barre de recherche et filtres */}
      <div className="mb-4 max-w-4xl mx-auto flex gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Rechercher une commande..."
          className="flex-1 p-3 border rounded shadow-sm"
        />

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="p-3 border rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="À valider">À valider</option>
          <option value="Validée">Validée</option>
          <option value="Rejetée">Rejetée</option>
        </select>

        <select
          value={revendeurFilter}
          onChange={handleRevendeurFilterChange}
          className="p-3 border rounded"
        >
          <option value="">Tous les revendeurs</option>
          {[...new Set(orders.map((order) => order.revendeur))].map(
            (revendeur, index) => (
              <option key={index} value={revendeur}>
                {revendeur}
              </option>
            )
          )}
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full text-sm bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Commande</th>
            <th className="p-3">Revendeur</th>
            <th className="p-3">Statut</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="p-3">{formatDate(order.date)}</td>
                <td className="p-3">{order.orderName}</td>
                <td className="p-3">{order.revendeur}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleShowDetails(order)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-3 text-center">
                Aucune commande trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Popup de détails */}
      {showDetailsPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Détails de la commande</h2>
            <p><strong>Nom :</strong> {selectedOrder.orderName}</p>
            <p><strong>Date :</strong> {formatDate(selectedOrder.date)}</p>
            <p><strong>Revendeur :</strong> {selectedOrder.revendeur}</p>
            <p><strong>Statut :</strong> {selectedOrder.status}</p>
            <p><strong>Produits :</strong></p>
            <ul className="list-disc list-inside">
              {selectedOrder.products.map((product, index) => (
                <li key={index}>
                  {product.name} - Quantité : {product.quantity}
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDetailsPopup(false)}
                className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandesList;
