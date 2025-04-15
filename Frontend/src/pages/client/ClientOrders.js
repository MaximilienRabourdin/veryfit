import React from "react";

const ClientOrders = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Commandes</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Commande</th>
            <th className="border p-2">État</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">Commande #123</td>
            <td className="border p-2">Livrée</td>
            <td className="border p-2">
              <button className="bg-blue-500 text-white px-2 py-1 rounded">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClientOrders;
