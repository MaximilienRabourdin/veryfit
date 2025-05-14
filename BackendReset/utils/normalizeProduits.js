// ✅ Ce helper transforme un objet produits en tableau normalisé
export const normalizeProduits = (produits) => {
    if (!produits) return [];
  
    let array = Array.isArray(produits)
      ? produits
      : typeof produits === "object"
      ? Object.values(produits)
      : [];
  
    // 🔄 Normalisation des objets produits
    return array.map((p) => ({
      name: p.name || "Produit inconnu",
      quantity: p.quantity || 1,
      typeFormulaire: p.typeFormulaire || "typeA",
      filled: typeof p.filled === "boolean" ? p.filled : false,
      ...p,
    }));
  };
  