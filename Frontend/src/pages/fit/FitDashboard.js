import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
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
  FaClock,
  FaCalendarCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const FitDashboard = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // 1. Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Firestore listeners (uniquement si user)
  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  // 🔹 NOUVEAU : Fonction pour formater les dates de manière robuste
  const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    let dateObj;
    if (dateInput.toDate && typeof dateInput.toDate === 'function') {
      dateObj = dateInput.toDate();
    } else if (dateInput.seconds) {
      dateObj = new Date(dateInput.seconds * 1000);
    } else if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else {
      dateObj = new Date(dateInput);
    }
    
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🔹 NOUVEAU : Calculer les jours restants
  const getDaysRemaining = (dateInput) => {
    if (!dateInput) return null;
    
    let dateObj;
    if (dateInput.toDate && typeof dateInput.toDate === 'function') {
      dateObj = dateInput.toDate();
    } else if (dateInput.seconds) {
      dateObj = new Date(dateInput.seconds * 1000);
    } else if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else {
      dateObj = new Date(dateInput);
    }
    
    if (isNaN(dateObj.getTime())) return null;
    
    const now = new Date();
    const diffTime = dateObj - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // 🔹 NOUVEAU : Obtenir le statut du contrôle périodique
  const getControleStatus = (order) => {
    if (!order.controlePeriodiqueDate) return 'no_date';
    
    const daysRemaining = getDaysRemaining(order.controlePeriodiqueDate);
    
    if (daysRemaining === null) return 'no_date';
    if (daysRemaining < 0) return 'overdue'; // En retard
    if (daysRemaining === 0) return 'today'; // Aujourd'hui
    if (daysRemaining <= 7) return 'urgent'; // Dans la semaine
    if (daysRemaining <= 30) return 'soon'; // Dans le mois
    return 'pending'; // Plus tard
  };

  // 🔹 NOUVEAU : Trier les contrôles par priorité
  const getControlesByPriority = () => {
    return orders
      .filter(order => order.controlePeriodiqueDate)
      .map(order => ({
        ...order,
        daysRemaining: getDaysRemaining(order.controlePeriodiqueDate),
        status: getControleStatus(order),
        formattedDate: formatDate(order.controlePeriodiqueDate)
      }))
      .sort((a, b) => {
        // Trier par priorité : overdue > today > urgent > soon > pending
        const priority = { overdue: 0, today: 1, urgent: 2, soon: 3, pending: 4 };
        if (priority[a.status] !== priority[b.status]) {
          return priority[a.status] - priority[b.status];
        }
        // Si même priorité, trier par date
        return (a.daysRemaining || 0) - (b.daysRemaining || 0);
      });
  };

  // 🔹 NOUVEAU : Statistiques des contrôles périodiques
  const getControleStats = () => {
    const controles = getControlesByPriority();
    return {
      total: controles.length,
      overdue: controles.filter(c => c.status === 'overdue').length,
      today: controles.filter(c => c.status === 'today').length,
      urgent: controles.filter(c => c.status === 'urgent').length,
      soon: controles.filter(c => c.status === 'soon').length,
      pending: controles.filter(c => c.status === 'pending').length
    };
  };

  // 3. Si pas encore d'utilisateur, ne pas exécuter la suite
  if (!user) return <div className="p-6">Chargement de l'utilisateur...</div>;

  const handleDeleteDossier = async (dossierId) => {
    const confirm = window.confirm("❗️Êtes-vous sûr de vouloir supprimer ce dossier ?");
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

  const controleStats = getControleStats();
  const prochains = getControlesByPriority().slice(0, 10);

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

      {/* 🔹 NOUVEAU : Section des statistiques avec contrôles périodiques */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
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

        {/* 🔹 NOUVEAU : Statistique contrôles en retard */}
        <div className="bg-white p-4 rounded shadow-md">
          <FaExclamationTriangle className="text-red-500 text-3xl mb-2" />
          <p className="font-semibold">Contrôles en retard</p>
          <p className="text-2xl text-red-500 font-bold">
            {controleStats.overdue + controleStats.today}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {controleStats.overdue} en retard, {controleStats.today} aujourd'hui
          </p>
        </div>

        {/* 🔹 NOUVEAU : Statistique contrôles à venir */}
        <div className="bg-white p-4 rounded shadow-md">
          <FaClock className="text-blue-500 text-3xl mb-2" />
          <p className="font-semibold">Contrôles à venir</p>
          <p className="text-2xl text-blue-500 font-bold">
            {controleStats.urgent + controleStats.soon}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {controleStats.urgent} cette semaine, {controleStats.soon} ce mois
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

        {/* 🔹 MODIFIÉ : Section calendrier améliorée */}
        <div className="bg-white shadow-md p-4 rounded">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaCalendarCheck className="text-blue-600" />
            Contrôles Périodiques
          </h2>
          
          <Calendar onChange={setDate} value={date} className="mb-4" />
          
          {/* 🔹 NOUVEAU : Résumé des contrôles par priorité */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-sm mb-2">📊 Résumé</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>🔴 En retard:</span>
                <span className="font-bold text-red-600">{controleStats.overdue}</span>
              </div>
              <div className="flex justify-between">
                <span>🟡 Aujourd'hui:</span>
                <span className="font-bold text-yellow-600">{controleStats.today}</span>
              </div>
              <div className="flex justify-between">
                <span>🟠 Cette semaine:</span>
                <span className="font-bold text-orange-600">{controleStats.urgent}</span>
              </div>
              <div className="flex justify-between">
                <span>🔵 Ce mois:</span>
                <span className="font-bold text-blue-600">{controleStats.soon}</span>
              </div>
            </div>
          </div>

          {/* 🔹 NOUVEAU : Liste détaillée des prochains contrôles */}
          <div>
            <h3 className="font-bold text-sm text-gray-600 mb-3">🗓️ Prochains contrôles</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {prochains.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Aucun contrôle périodique programmé</p>
              ) : (
                prochains.map(order => {
                  const getStatusInfo = (status, days) => {
                    switch (status) {
                      case 'overdue':
                        return {
                          icon: '🔴',
                          text: `En retard de ${Math.abs(days)} jour${Math.abs(days) > 1 ? 's' : ''}`,
                          bgColor: 'bg-red-50',
                          borderColor: 'border-red-200',
                          textColor: 'text-red-700'
                        };
                      case 'today':
                        return {
                          icon: '🟡',
                          text: 'Aujourd\'hui',
                          bgColor: 'bg-yellow-50',
                          borderColor: 'border-yellow-200',
                          textColor: 'text-yellow-700'
                        };
                      case 'urgent':
                        return {
                          icon: '🟠',
                          text: `Dans ${days} jour${days > 1 ? 's' : ''}`,
                          bgColor: 'bg-orange-50',
                          borderColor: 'border-orange-200',
                          textColor: 'text-orange-700'
                        };
                      case 'soon':
                        return {
                          icon: '🔵',
                          text: `Dans ${days} jour${days > 1 ? 's' : ''}`,
                          bgColor: 'bg-blue-50',
                          borderColor: 'border-blue-200',
                          textColor: 'text-blue-700'
                        };
                      default:
                        return {
                          icon: '⚪',
                          text: `Dans ${days} jour${days > 1 ? 's' : ''}`,
                          bgColor: 'bg-gray-50',
                          borderColor: 'border-gray-200',
                          textColor: 'text-gray-700'
                        };
                    }
                  };

                  const statusInfo = getStatusInfo(order.status, order.daysRemaining);

                  return (
                    <div
                      key={order.id}
                      className={`p-3 border rounded-md cursor-pointer hover:shadow-sm transition-shadow ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                      onClick={() => navigate(`/fit/orders/${order.id}`)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm truncate pr-2">
                          {statusInfo.icon} {order.orderName}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-1">
                        📧 {order.revendeurEmail || 'Email non défini'}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          📅 {order.formattedDate}
                        </span>
                        <span className={`text-xs font-medium ${statusInfo.textColor}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      
                      {order.produits && order.produits.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          🔧 {order.produits.length} produit{order.produits.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitDashboard;