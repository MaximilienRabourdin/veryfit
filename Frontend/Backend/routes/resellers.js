const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// Liste des revendeurs
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('resellers').select('*');

  if (error) {
    
    return res.status(500).json({ msg: 'Erreur lors de la récupération des revendeurs' });
  }

  res.json(data);
});

// Création d'un revendeur
router.post('/create', async (req, res) => {
  const { name, region, contact } = req.body;

  const { data, error } = await supabase
    .from('resellers')
    .insert([{ name, region, contact }]);

  if (error) {
    
    return res.status(500).json({ msg: 'Erreur lors de la création du revendeur' });
  }

  res.json({ msg: 'Revendeur créé', reseller: data });
});

module.exports = router;
