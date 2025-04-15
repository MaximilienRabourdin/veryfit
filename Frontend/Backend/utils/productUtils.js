// utils/productUtils.js

export const determineTypeFormulaire = (productName) => {
    if (!productName) return "typeA"; // fallback
  
    return productName.toLowerCase().includes("husky") ? "typeB" : "typeA";
  };
  