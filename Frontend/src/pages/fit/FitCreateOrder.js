import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productsService";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";

const FitCreateOrder = () => {
  const [revendeurs, setRevendeurs] = useState([]);
  const [carrossiers, setCarrossiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRevendeur, setSelectedRevendeur] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [orderName, setOrderName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [clientAffaireNumber, setClientAffaireNumber] = useState("");
  const [clientOrderNumber, setClientOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log("🔍 Récupération des utilisateurs...");
        console.log("🔐 Utilisateur actuel:", auth.currentUser?.uid);
        
        const snapshot = await getDocs(collection(db, "users_webapp"));
        const revs = [];
        const carros = [];
        
        console.log(`📊 Nombre total d'utilisateurs trouvés: ${snapshot.docs.length}`);
        
        if (snapshot.docs.length === 0) {
          console.error("❌ Aucun document trouvé dans users_webapp - Problème de permissions Firestore probable");
          return;
        }
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const role = (data.role || "").trim();
          const user = {
            id: doc.id,
            ...data,
            company: data.Nom || data.nom || data.company || "Société inconnue",
            contact: data.Contact || data.contact || "",
          };
          
          console.log(`👤 Utilisateur ${doc.id}:`, {
            role: role,
            roleOriginal: data.role,
            isApproved: data.isApproved,
            company: user.company,
            email: data.email
          });
          
          const roleNormalized = role.toLowerCase();
          console.log(`🔄 Rôle normalisé pour ${user.company}: "${roleNormalized}"`);
          
          const isApprovedOrDefault = data.isApproved === true || data.isApproved === undefined;
          
          if (isApprovedOrDefault) {
            if (roleNormalized === "revendeur") {
              revs.push(user);
              console.log("✅ Revendeur ajouté:", user.company);
            } else if (roleNormalized === "carrossier") {
              carros.push(user);
              console.log("✅ Carrossier ajouté:", user.company);
            } else {
              console.log(`⚠️ Rôle non reconnu pour ${user.company}: "${roleNormalized}"`);
            }
          } else {
            console.log("⛔ Utilisateur non approuvé:", user.company);
          }
        });
        
        console.log(`📈 Résultats finaux: ${revs.length} revendeurs, ${carros.length} carrossiers`);
        setRevendeurs(revs);
        setCarrossiers(carros);
      } catch (err) {
        console.error("❌ Erreur récupération des utilisateurs :", err);
      }
    };

    fetchUsers();
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    if (deliveryDate) {
      const newDate = new Date(deliveryDate);
      newDate.setMonth(newDate.getMonth() + 6);
      setServiceDate(newDate.toISOString().split("T")[0]);
    }
  }, [deliveryDate]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    const dossierId = uuidv4();

    try {
      const destinataire = [...revendeurs, ...carrossiers].find((r) => r.id === selectedRevendeur);
      const destinataireEmail = destinataire?.email || "";

      const produitsAvecInfos = selectedProducts.map((prod) => {
        const produitComplet = products.find((p) => p.id === prod.productId);
        const productId = produitComplet?.id || "";
        const productName = produitComplet?.name || "";
      
        return {
          uuid: uuidv4(),
          ...prod,
          productId,
          name: productName,
          typeFormulaire:
            productName.trim().toUpperCase() === "FIT CLEVER SAFE HUSKY"
              ? "typeB"
              : "typeA",
          filled: false,
          formulaireData: null,
          documentsChoisis: prod.documentsChoisis,
        };
      });

      const formDataToSend = new FormData();
      selectedProducts.forEach((prod, index) => {
        if (prod.file) {
          formDataToSend.append(`file_produit_${index}`, prod.file);
        }
      });

      const payload = {
        id: dossierId,
        orderName,
        revendeur: selectedRevendeur,
        revendeurEmail: destinataireEmail,
        destinataire_type: destinataire?.role || "Revendeur",
        produits: produitsAvecInfos,
        deliveryDate,
        serviceDate,
        clientAffaireNumber,
        clientOrderNumber,
        status: "en_attente_remplissage",
        createdAt: new Date().toISOString(),
      };

      formDataToSend.append("data", JSON.stringify(payload));

      console.log("📦 Envoi du dossier :", payload);

      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://veryfit.onrender.com";

      console.log("🌐 URL API utilisée:", `${API_BASE_URL}/api/dossiers/create`);

      const response = await fetch(`${API_BASE_URL}/api/dossiers/create`, {
        method: "POST",
        body: formDataToSend,
      });

      console.log("📡 Réponse status:", response.status);
      console.log("📡 Réponse OK:", response.ok);

      if (!response.ok) {
        let errorText = "Erreur inconnue";
        try {
          const errorData = await response.json();
          errorText = errorData.details || errorData.error || errorData.message || "Erreur serveur";
          console.error("❌ Détail erreur serveur:", errorData);
        } catch (e) {
          try {
            errorText = await response.text();
            console.error("❌ Erreur serveur (texte):", errorText);
          } catch (e2) {
            console.error("❌ Impossible de lire l'erreur serveur:", e2);
          }
        }
        throw new Error(`Erreur création dossier: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Réponse serveur:", result);

      alert("✅ Dossier CE créé avec succès.");
      resetForm();
      
    } catch (error) {
      console.error("🚨 Erreur création dossier CE :", error);
      console.error("🚨 Stack trace:", error.stack);
      
      // Message d'erreur plus informatif pour l'utilisateur
      let userMessage = "Erreur création du dossier.";
      if (error.message.includes("500")) {
        userMessage = "Erreur serveur. Consultez les logs pour plus de détails.";
      } else if (error.message.includes("400")) {
        userMessage = "Données invalides. Vérifiez le formulaire.";
      } else if (error.message.includes("Failed to fetch")) {
        userMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
      } else if (error.message.includes("NetworkError")) {
        userMessage = "Problème de réseau. Réessayez dans quelques instants.";
      }
      
      alert(userMessage + "\n\nDétail technique: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    if (!orderName) {
      alert("Numéro de dossier manquant.");
      return false;
    }
    if (!selectedRevendeur) {
      alert("Sélectionnez un destinataire.");
      return false;
    }
    if (!selectedProducts.length) {
      alert("Ajoutez au moins un produit.");
      return false;
    }
    if (!deliveryDate) {
      alert("Date de livraison manquante.");
      return false;
    }
    
    // Vérification que tous les produits ont un ID
    for (let i = 0; i < selectedProducts.length; i++) {
      if (!selectedProducts[i].productId) {
        alert(`Sélectionnez un produit pour la ligne ${i + 1}.`);
        return false;
      }
    }
    
    return true;
  };

  const resetForm = () => {
    setOrderName("");
    setSelectedRevendeur("");
    setSelectedProducts([]);
    setDeliveryDate("");
    setServiceDate("");
    setClientAffaireNumber("");
    setClientOrderNumber("");
  };

  const addProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      {
        productId: "",
        quantity: 1,
        file: null,
        documentsChoisis: {
          declarationCE: true,
          declarationMontage: true,
          controlePeriodique: true,
          noticeInstruction: true,
        },
      },
    ]);
  };

  const removeProduct = (index) => {
    const updated = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updated);
  };

  const updateProduct = (index, key, value) => {
    const updated = [...selectedProducts];
    if (key === "file") {
      updated[index].file = value.target.files[0];
    } else if (key.startsWith("documentsChoisis.")) {
      const docKey = key.split(".")[1];
      updated[index].documentsChoisis[docKey] = value;
    } else {
      updated[index][key] = value;
    }
    setSelectedProducts(updated);
  };

  const productsByCategory = {
    "VAT RETROFIT": [],
    "CLEVER RETROFIT": [],
    "CLEVER SAFE": [],
  };

  const vatRetrofitProducts = [
    "FIT VAT BOIS",
    "FIT VAT CC",
    "FIT VAT FORTY",
    "FIT VAT RR",
    "FIT VAT HUSKY",
  ];

  const cleverRetrofitProducts = [
    "FIT CLEVER BOIS",
    "FIT CLEVER CC",
    "FIT CLEVER FORTY",
    "FIT CLEVER RR",
    "FIT CLEVER HUSKY",
  ];

  const cleverSafeProducts = [
    "FIT CLEVER SAFE BOIS",
    "FIT CLEVER SAFE CC",
    "FIT CLEVER SAFE FORTY",
    "FIT CLEVER SAFE RR",
    "FIT CLEVER SAFE HUSKY",
  ];

  products.forEach((product) => {
    const name = (product.name || "").trim().toUpperCase();
    const categorie = (product.categorie || "").trim().toUpperCase();

    if (vatRetrofitProducts.includes(name) || categorie === "VAT RETROFIT") {
      productsByCategory["VAT RETROFIT"].push(product);
    } else if (cleverRetrofitProducts.includes(name) || categorie === "CLEVER RETROFIT") {
      productsByCategory["CLEVER RETROFIT"].push(product);
    } else if (cleverSafeProducts.includes(name) || categorie === "CLEVER SAFE" || categorie === "SAFE") {
      productsByCategory["CLEVER SAFE"].push(product);
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-darkBlue mb-6">
        CRÉATION D'UN DOSSIER CE
      </h1>

      <form
        onSubmit={handleCreateOrder}
        encType="multipart/form-data"
        className="bg-white shadow-lg rounded-lg p-8 max-w-5xl mx-auto space-y-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Numéro du dossier" 
            value={orderName} 
            onChange={(e) => setOrderName(e.target.value)} 
            className="p-3 border rounded" 
            required
          />
          <input 
            type="text" 
            placeholder="Numéro d'affaire client" 
            value={clientAffaireNumber} 
            onChange={(e) => setClientAffaireNumber(e.target.value)} 
            className="p-3 border rounded" 
          />
          <input 
            type="text" 
            placeholder="Numéro de commande client" 
            value={clientOrderNumber} 
            onChange={(e) => setClientOrderNumber(e.target.value)} 
            className="p-3 border rounded" 
          />
          <select 
            value={selectedRevendeur} 
            onChange={(e) => setSelectedRevendeur(e.target.value)} 
            className="p-3 border rounded"
            required
          >
            <option value="">-- Choisir le destinataire --</option>
            {revendeurs.length > 0 && (
              <optgroup label="Revendeurs">
                {revendeurs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.company} ({r.email})
                  </option>
                ))}
              </optgroup>
            )}
            {carrossiers.length > 0 && (
              <optgroup label="Carrossiers">
                {carrossiers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.email})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <input 
            type="date" 
            value={deliveryDate} 
            onChange={(e) => setDeliveryDate(e.target.value)} 
            className="p-3 border rounded" 
            required
          />
          <input 
            type="date" 
            value={serviceDate} 
            disabled 
            className="p-3 border rounded bg-gray-100" 
            title="Date de service calculée automatiquement (+6 mois)"
          />
        </div>
       
        <div>
          <h2 className="font-bold text-lg mb-2">PRODUITS</h2>
          {selectedProducts.map((product, index) => (
            <div key={index} className="border p-4 rounded mb-4 space-y-2 relative">
              <button
                type="button"
                onClick={() => removeProduct(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xl"
                title="Supprimer ce produit"
              >
                ×
              </button>
              
              <select 
                value={product.productId} 
                onChange={(e) => updateProduct(index, "productId", e.target.value)} 
                className="p-3 border rounded w-full"
                required
              >
                <option value="">-- Sélectionnez un produit --</option>
                {Object.entries(productsByCategory).map(([category, produits]) => (
                  produits.length > 0 && (
                    <optgroup key={category} label={`📦 ${category}`}>
                      {produits.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )
                ))}
              </select>
              
              <input 
                type="number" 
                min={1} 
                value={product.quantity} 
                onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 1)} 
                className="p-3 border rounded w-full" 
                placeholder="Quantité"
              />
              
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={(e) => updateProduct(index, "file", e)} 
                className="p-2 border rounded w-full" 
                title="Fichier PDF optionnel"
              />
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(product.documentsChoisis).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={val} 
                      onChange={(e) => updateProduct(index, `documentsChoisis.${key}`, e.target.checked)} 
                    />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addProduct} 
            className="text-blue-600 hover:text-blue-800 font-bold mt-2 border border-blue-600 px-4 py-2 rounded hover:bg-blue-50"
          >
            + Ajouter un produit
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-6 py-3 rounded shadow transition text-white font-bold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Création en cours..." : "CRÉER LE DOSSIER CE"}
        </button>
      </form>
    </div>
  );
};

export default FitCreateOrder;