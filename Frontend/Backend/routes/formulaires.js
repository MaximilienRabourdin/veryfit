router.post("/remplir", async (req, res) => {
    try {
      const { dossierId, produitId, typeFormulaire, donnees } = req.body;
  
      const dossierRef = db.collection("dossiers").doc(dossierId);
      const dossierSnap = await dossierRef.get();
  
      if (!dossierSnap.exists) return res.status(404).json({ error: "Dossier non trouvé." });
  
      const dossier = dossierSnap.data();
      const produits = dossier.produits.map(p => {
        if (p.productId === produitId) {
          return {
            ...p,
            formulaireRempli: true,
            formulaireData: donnees,
          };
        }
        return p;
      });
  
      const isComplete = produits.every(p => p.formulaireRempli);
  
      await dossierRef.update({
        produits,
        status: isComplete ? "terminé" : "en_cours",
      });
  
      if (isComplete) {
        await dossierRef.delete(); // ou move vers une autre collection si tu veux l’archiver
      }
  
      res.json({ success: true, isComplete });
    } catch (error) {
      
      res.status(500).json({ error: "Erreur serveur", details: error.message });
    }
  });
  