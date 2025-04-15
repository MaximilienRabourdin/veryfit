const express = require("express");
const { getAllProducts, getProductById, getProductForm } = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts); // Récupérer tous les produits
router.get("/:productId", getProductById); // Récupérer un produit spécifique
router.get("/forms/:productId", getProductForm); // Récupérer le formulaire du produit

module.exports = router;
