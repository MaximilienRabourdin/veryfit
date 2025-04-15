import React from "react";
import { addOrder } from "../../services/ordersService";

const TestAddOrder = () => {
  const testCreateOrder = async () => {
    const newOrder = {
      revendeur: "revendeur123",
      orderName: "Test Commande",
      referenceNumber: "REF123",
      status: "À valider",
      date: new Date().toISOString(),
    };

    try {
      const orderId = await addOrder(newOrder);
      console.log("Nouvelle commande créée avec ID :", orderId);
      alert(`Commande créée avec succès : ${orderId}`);
    } catch (error) {
      console.error("Erreur lors de la création de la commande :", error.message);
      alert("Erreur lors de la création de la commande.");
    }
  };

  return (
    <div className="p-6">
      <button
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={testCreateOrder}
      >
        Tester la création d'une commande
      </button>
    </div>
  );
};

export default TestAddOrder;
