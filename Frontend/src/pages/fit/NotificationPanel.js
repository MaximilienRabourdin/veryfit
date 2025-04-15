import React, { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("read", "==", false), where("userId", "==", "adminId")); // Filtre pour les notifications non lues
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe(); // Nettoyage pour éviter les fuites mémoire
  }, []);

  const markAsRead = async (id) => {
    const notificationRef = doc(db, "notifications", id);
    await updateDoc(notificationRef, { read: true });
  };

  return (
    <div className="bg-white shadow-md p-4 rounded max-w-md">
      <h2 className="text-lg font-bold mb-4">Notifications</h2>
      {notifications.length > 0 ? (
        <ul>
          {notifications.map((notif) => (
            <li key={notif.id} className="mb-2 border-b pb-2">
              <p>{notif.message}</p>
              <small className="text-gray-500">{new Date(notif.createdAt).toLocaleString()}</small>
              <button
                onClick={() => markAsRead(notif.id)}
                className="bg-blue-500 text-white py-1 px-3 rounded mt-2 hover:bg-blue-600"
              >
                Marquer comme lu
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune notification non lue.</p>
      )}
    </div>
  );
};

export default NotificationsPanel;
