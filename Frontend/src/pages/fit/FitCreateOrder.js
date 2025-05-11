import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productsService";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";

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
        const snapshot = await getDocs(collection(db, "users_webapp"));
        const revs = [];
        const carros = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const role = (data.role || "").trim().toUpperCase();
          const user = {
            id: doc.id,
            ...data,
            company: data.Nom || data.nom || data.company || "Non_inconnu",
            contact: data.Contact || data.contact || "",
          };
          if (data.isApproved === true) {
            if (role === "REVENDEUR") revs.push(user);
            else if (role === "CARROSSIER") carros.push(user);
          }
        });
        setRevendeurs(revs);
        setCarrossiers(carros);
      } catch (err) {
        console.error("Erreur récupération des utilisateurs :", err);
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
          uuid: uuidv4(), // ✅ identifiant unique pour chaque produit
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
        : "https://veryfit.fr";

        const response = await fetch(`${API_BASE_URL}/api/dossiers/create`, {
          method: "POST",
          body: formDataToSend,
        });

      if (!response.ok) throw new Error("Erreur création dossier");

      alert("✅ Dossier CE créé avec succès.");
      resetForm();
    } catch (error) {
      console.error("🚨 Erreur création dossier CE :", error);
      alert("Erreur création du dossier.");
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    if (!orderName) return alert("Numéro de dossier manquant.");
    if (!selectedRevendeur) return alert("Sélectionnez un destinataire.");
    if (!selectedProducts.length) return alert("Ajoutez un produit.");
    if (!deliveryDate) return alert("Date de livraison manquante.");
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
          <input type="text" placeholder="Numéro du dossier" value={orderName} onChange={(e) => setOrderName(e.target.value)} className="p-3 border rounded" />
          <input type="text" placeholder="Numéro d'affaire client" value={clientAffaireNumber} onChange={(e) => setClientAffaireNumber(e.target.value)} className="p-3 border rounded" />
          <input type="text" placeholder="Numéro de commande client" value={clientOrderNumber} onChange={(e) => setClientOrderNumber(e.target.value)} className="p-3 border rounded" />
          <select value={selectedRevendeur} onChange={(e) => setSelectedRevendeur(e.target.value)} className="p-3 border rounded">
            <option value="">-- Choisir le destinataire --</option>
            <optgroup label="Revendeurs">
              {revendeurs.map((r) => (<option key={r.id} value={r.id}>{r.company}</option>))}
            </optgroup>
            <optgroup label="Carrossiers">
              {carrossiers.map((c) => (<option key={c.id} value={c.id}>{c.company}</option>))}
            </optgroup>
          </select>
          <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="p-3 border rounded" />
          <input type="date" value={serviceDate} disabled className="p-3 border rounded bg-gray-100" />
        </div>

        <div>
          <h2 className="font-bold text-lg mb-2">PRODUITS</h2>
          {selectedProducts.map((product, index) => (
            <div key={index} className="border p-4 rounded mb-4 space-y-2">
              <select value={product.productId} onChange={(e) => updateProduct(index, "productId", e.target.value)} className="p-3 border rounded w-full">
                <option value="">-- Produit --</option>
                {Object.entries(productsByCategory).map(([category, produits]) => (
                  <optgroup key={category} label={`📦 ${category}`}>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input type="number" min={1} value={product.quantity} onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value))} className="p-3 border rounded w-full" />
              <input type="file" accept="application/pdf" onChange={(e) => updateProduct(index, "file", e)} className="p-2 border rounded w-full" />
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(product.documentsChoisis).map(([key, val]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input type="checkbox" checked={val} onChange={(e) => updateProduct(index, `documentsChoisis.${key}`, e.target.checked)} />
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="button" onClick={addProduct} className="text-blue-600 font-bold mt-2">
            + Ajouter un produit
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded shadow transition text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Envoi en cours..." : "VALIDER LE DOSSIER"}
        </button>
      </form>
    </div>
  );
};

export default FitCreateOrder;
