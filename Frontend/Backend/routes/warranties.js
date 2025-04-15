const express = require('express');
const { 
    addWarranty, 
    getWarrantyByProduct, 
    getClientWarranties, 
    validateInstallation 
} = require('../controllers/warrantyControllers'); // Import des fonctions nécessaires
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Ajouter une garantie
router.post('/add', authMiddleware, roleMiddleware(['admin', 'fit']), addWarranty);

// Obtenir une garantie par produit
router.get('/:product_id', authMiddleware, roleMiddleware(['client']), getWarrantyByProduct);

// Récupérer les garanties d'un client
router.get('/client', authMiddleware, roleMiddleware(['client', 'admin']), getClientWarranties);

// Valider une installation
router.post('/validate', authMiddleware, roleMiddleware(['admin', 'fit']), validateInstallation);

module.exports = router;
