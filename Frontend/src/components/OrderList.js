import React from "react";

const OrdersList = ({ orders = [], error }) => {
  // Par défaut, on initialise orders à un tableau vide si undefined

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!orders.length) {
    return <p>Aucune commande à afficher.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dernières commandes</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id} className="flex justify-between border-b py-2">
            <span>Commande #{order.id}</span>
            <span>{order.status || "Statut inconnu"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
