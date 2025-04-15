router.post("/track-session", async (req, res) => {
    const { uid, role } = req.body;
  
    if (!uid || !role) {
      return res.status(400).json({ message: "UID et rôle requis." });
    }
  
    try {
      await db.collection("sessions").doc(uid).set(
        {
          lastLogin: new Date().toISOString(),
          role,
        },
        { merge: true }
      );
      res.status(200).json({ message: "Session enregistrée." });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la session :", error);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  });
  