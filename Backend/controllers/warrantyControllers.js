const supabase = require('../config/db');

// Ajouter une garantie à un produit
const addWarranty = async (req, res) => {
  const { order_id, product_id, warranty_expiry } = req.body;

  try {
    const { data, error } = await supabase
      .from('warranties')
      .insert([{ order_id, product_id, warranty_expiry }]);

    if (error) throw error;

    res.json({ msg: 'Garantie ajoutée avec succès', warranty: data });
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de l\'ajout de la garantie', error: err.message });
  }
};

// Obtenir les garanties associées à un produit
const getWarrantyByProduct = async (req, res) => {
  const { product_id } = req.params;

  try {
    const { data, error } = await supabase
      .from('warranties')
      .select('*')
      .eq('product_id', product_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération de la garantie', error: err.message });
  }
};

// Valider une installation
const validateInstallation = async (req, res) => {
  const { orderId, signature, resellerId } = req.body;

  try {
    const { data, error } = await supabase
      .from('warranties')
      .insert([{ order_id: orderId, signature, reseller_id: resellerId, status: 'Validé' }]);

    if (error) {
      return res.status(500).json({ message: 'Erreur lors de la validation de l\'installation', error });
    }

    res.status(200).json({ message: 'Installation validée avec succès', data });
  } catch (err) {
    res.status(500).json({ message: 'Erreur interne du serveur', error: err.message });
  }
};

// Récupérer les garanties d'un client spécifique
const getClientWarranties = async (req, res) => {
  const { clientId } = req.query;

  if (!clientId) {
    return res.status(400).json({ message: "L'ID du client est requis" });
  }

  try {
    const { data, error } = await supabase
      .from('warranties')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des garanties du client', error: err.message });
  }
};

module.exports = {
  addWarranty,
  getWarrantyByProduct,
  validateInstallation,
  getClientWarranties,
};
