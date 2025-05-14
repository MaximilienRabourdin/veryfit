
// Valider un montage
const validateInstallation = async (req, res) => {
  const { order_id, reseller_id, signature } = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Validé', signature })
      .eq('id', order_id)
      .eq('reseller_id', reseller_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ msg: 'Installation validée avec succès', order: data });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la validation de l\'installation', error: err });
  }
};

const getRevendeurEmail = async (revendeurId) => {
  try {
    const userRef = db.collection("users_webapp").doc(revendeurId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("Revendeur introuvable");
    }

    const userData = userDoc.data();

    // Vérification du rôle
    if (userData.role !== "Revendeur") {
      throw new Error("L'utilisateur sélectionné n'est pas un revendeur.");
    }

    return userData.email; // Retourne l'email du revendeur
  } catch (error) {
    
    throw error;
  }
};

module.exports = {
  validateInstallation,
  getRevendeurEmail
};