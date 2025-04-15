const express = require('express');
const { getWarrantyDetails } = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.get('/warranties', authMiddleware, roleMiddleware(['client']), getWarrantyDetails);

module.exports = router;