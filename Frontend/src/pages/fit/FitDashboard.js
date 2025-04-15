import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaBell, FaSearch, FaClipboardCheck, FaFileSignature } from "react-icons/fa";

const FitDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeDossiers = onSnapshot(
      query(collection(db, "dossiers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setOrders(data);
      }
    );

    const unsubscribeNotifications = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setNotifications(fetched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      }
    );

    return () => {
      unsubscribeDossiers();
      unsubscribeNotifications();
    };
  }, []);

  const countDocumentsCompletes = (order) => {
    if (!order.produits || !Array.isArray(order.produits)) return 0;

    return order.produits.reduce((acc, produit) => {
      let count = 0;

      if (produit.formulaire || produit.formulaireData) count += 1;
      if (produit.declarationMontage?.url) count += 1;
      if (produit.declarationCE?.url) count += 1;

      return acc + count;
    }, 0);
  };

  const countDocumentsTotal = (order) => {
    if (!order.produits || !Array.isArray(order.produits)) return 0;

    return order.produits.length * 3; // formulaire + déclaration montage + déclaration CE
  };

  return (
    <div className="p-6 bg-lightGray min-h-screen flex flex-col relative">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-darkBlue">Bienvenue</h1>
        <div className="relative">
          <FaBell className="w-6 h-6 text-blue-600 cursor-pointer" onClick={() => setShowNotifications(!showNotifications)} />
        </div>
      </header>

      {showNotifications && (
        <div className="absolute right-0 top-16 bg-white shadow-lg w-96 h-96 overflow-y-auto p-4 z-10 border">
          <h2 className="text-lg font-bold mb-4">Notifications</h2>
          {notifications.map((notif) => (
            <div key={notif.id} className="mb-4 border-b pb-2">
              <p>{notif.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow-md">
          <FaClipboardCheck className="text-green-600 text-3xl mb-2" />
          <p className="font-semibold">Documents complétés</p>
          <p className="text-2xl text-green-600 font-bold">
            {orders.reduce((acc, o) => acc + countDocumentsCompletes(o), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <FaFileSignature className="text-yellow-500 text-3xl mb-2" />
          <p className="font-semibold">Documents en attente</p>
          <p className="text-2xl text-yellow-500 font-bold">
            {orders.reduce(
              (acc, o) => acc + (countDocumentsTotal(o) - countDocumentsCompletes(o)),
              0
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md p-4 rounded mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-4">Derniers dossiers CE</h2>
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">Dossier</th>
                  <th className="p-2 text-left">Destinataire</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Documents reçus</th>
                  <th className="p-2 text-left">Voir</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-100">
                    <td className="p-2">{order.orderName}</td>
                    <td className="p-2">{order.revendeurEmail || "—"}</td>
                    <td className="p-2">{order.destinataire_type || "Revendeur"}</td>
                    <td className="p-2">
                      {countDocumentsCompletes(order)} / {countDocumentsTotal(order)}
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => navigate(`/fit/orders/${order.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaSearch />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-md p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Calendrier</h2>
          <Calendar onChange={setDate} value={date} />
        </div>
      </div>
    </div>
  );
};

export default FitDashboard;
