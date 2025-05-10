import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  deleteField,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  FaBell,
  FaTrash,
  FaSearch,
  FaClipboardCheck,
  FaFileSignature,
  FaTimes,
} from "react-icons/fa";

const FitDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeDossiers = onSnapshot(
      query(collection(db, "dossiers"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
      }
    );

    const unsubscribeNotifications = onSnapshot(
      collection(db, "notifications"),
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(
          fetched.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          )
        );
      }
    );

    return () => {
      unsubscribeDossiers();
      unsubscribeNotifications();
    };
  }, []);

  const handleDeleteDossier = async (dossierId) => {
    const confirm = window.confirm(
      "❗️Êtes-vous sûr de vouloir supprimer ce dossier ?"
    );
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "dossiers", dossierId));
      alert("✅ Dossier supprimé avec succès !");
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("❌ Une erreur est survenue lors de la suppression.");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await deleteDoc(doc(db, "notifications", notifId));
    } catch (error) {
      console.error("Erreur suppression notification :", error);
    }
  };

  const countDocumentsCompletes = (order) => {
    let count = 0;

    if (order.produits && Array.isArray(order.produits)) {
      count += order.produits.reduce((acc, produit) => {
        let c = 0;
        if (produit.formulaire || produit.formulaireData) c += 1;
        if (produit.documents?.declarationMontage?.url) c += 1;
        if (produit.documents?.declarationCE?.url) c += 1;
        return acc + c;
      }, 0);
    }

    if (order.declarationMontageCarrossierPdf) {
      count += 1;
    }

    return count;
  };

  const countDocumentsTotal = (order) => {
    if (!order.produits || !Array.isArray(order.produits)) return 0;
    return order.produits.length * 3 + 1;
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderName?.toLowerCase().includes(term) ||
      order.revendeurEmail?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 bg-lightGray min-h-screen flex flex-col relative font-sans">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-darkBlue">Bienvenue</h1>
        <div className="relative">
          <FaBell
            className="w-6 h-6 text-blue-600 cursor-pointer"
            onClick={() => setShowNotifications(!showNotifications)}
          />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 w-3 h-3 rounded-full"></span>
          )}
        </div>
      </header>

      {showNotifications && (
        <div className="absolute right-0 top-16 bg-white shadow-lg w-96 h-96 overflow-y-auto p-4 z-10 border">
          <h2 className="text-lg font-bold mb-4">Notifications</h2>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="mb-4 border-b pb-2 flex justify-between items-start gap-2"
            >
              <div className="text-sm flex-1">
                <p
                  className="text-blue-700 hover:underline cursor-pointer"
                  onClick={() => navigate(`/fit/orders/${notif.dossierId}`)}
                >
                  {notif.message}
                </p>
              </div>
              <button
                onClick={() => handleDeleteNotification(notif.id)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-gray-500">Aucune notification.</p>
          )}
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
          <div className="bg-white shadow-md p-4 rounded mb-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Derniers dossiers CE</h2>

            <input
              type="text"
              placeholder="Rechercher un dossier ou un email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 w-full border p-2 rounded"
            />

            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Dossier</th>
                    <th className="p-3 text-left">Destinataire</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Documents reçus</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 truncate max-w-[180px]">
                        {order.orderName}
                      </td>
                      <td className="p-3 truncate max-w-[220px]">
                        {order.revendeurEmail || "—"}
                      </td>
                      <td className="p-3">
                        {order.destinataire_type || "Revendeur"}
                      </td>
                      <td className="p-3">
                        {countDocumentsCompletes(order)} / {countDocumentsTotal(order)}
                      </td>
                      <td className="p-3 flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/fit/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir le dossier"
                        >
                          <FaSearch />
                        </button>
                        <button
                          onClick={() => handleDeleteDossier(order.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  Aucun dossier trouvé.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md p-4 rounded">
          <h2 className="text-lg font-bold mb-4">Calendrier</h2>
          <Calendar onChange={setDate} value={date} />
          <div className="mt-4">
  <h3 className="font-bold text-sm text-gray-600 mb-2">📆 Rappels à venir</h3>
  <ul className="text-sm space-y-1">
    {orders
      .filter(order => order.controlePeriodiqueDate)
      .filter(order => {
        const target = new Date(order.controlePeriodiqueDate.seconds * 1000);
        return target >= new Date();
      })
      .sort((a, b) => a.controlePeriodiqueDate.seconds - b.controlePeriodiqueDate.seconds)
      .slice(0, 5)
      .map(order => {
        const date = new Date(order.controlePeriodiqueDate.seconds * 1000).toLocaleDateString();
        return (
          <li key={order.id}>
            📄 {order.orderName} – <span className="text-gray-500">{date}</span>
          </li>
        );
      })}
  </ul>
</div>

        </div>
      </div>
    </div>
  );
};

export default FitDashboard;
