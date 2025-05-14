const supabase = require('../config/db');

// Récupérer les garanties pour un client
const getWarrantyDetails = async (req, res) => {
  const { user_id } = req.user;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_name,
        status,
        order_products (
          product_id,
          quantity,
          products (
            name,
            category
          )
        )
      `)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ msg: 'Erreur lors de la récupération des garanties', error: err });
  }
};

module.exports = {
  getWarrantyDetails,
};