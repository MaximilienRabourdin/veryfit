export const normalizeProduits = (produits) => {
    if (Array.isArray(produits)) return produits;
    if (produits && typeof produits === "object") return Object.values(produits);
    return [];
  };
  