const addLogEntry = async (action, performedBy, details) => {
    try {
      await db.collection("logs").add({
        action,
        performedBy, // Email ou ID
        details, // Par exemple : { userId: "abc123", change: "Updated role to Revendeur" }
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout au journal :", error);
    }
  };
  