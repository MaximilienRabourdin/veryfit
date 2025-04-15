import React, { useEffect, useState } from "react";
import { fetchRevendeurs } from "../../services/revendeurService";
import { fetchProducts } from "../../services/productsService";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs, query, where } from "firebase/firestore";
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
  const [conformiteFile, setConformiteFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevendeurs().then(setRevendeurs).catch(console.error);
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchCarrossiers = async () => {
      try {
        const q = query(
          collection(db, "users_webapp"),
          where("role", "==", "Carrossier"),
          where("isApproved", "==", true) // 👈 On s’assure que seuls les comptes validés s'affichent
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            company: data.Nom || data.nom || data.company || "Non_inconnu",
            contact: data.Contact || data.contact || "",
          };
        });
        setCarrossiers(list);
      } catch (err) {
        console.error("Erreur récupération carrossiers :", err);
      }
    };
    fetchCarrossiers();
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

    try {
      const destinataire = [...revendeurs, ...carrossiers].find(
        (r) => r.id === selectedRevendeur
      );
      const destinataireEmail = destinataire?.email || "";

      const produitsAvecInfos = selectedProducts.map((prod) => {
        const produitComplet = products.find((p) => p.id === prod.productId);
        return {
          ...prod,
          name: produitComplet?.name || "",
          typeFormulaire:
            produitComplet?.name === "FIT Clever SAFE Husky"
              ? "typeB"
              : "typeA",
          filled: false,
          formulaireData: null,
        };
      });

      const formDataToSend = new FormData();
      formDataToSend.append("file", conformiteFile);
      formDataToSend.append(
        "data",
        JSON.stringify({
          id: uuidv4(),
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
        })
      );

      const response = await fetch(
        "http://localhost:5000/api/dossiers/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) throw new Error("Erreur création dossier");

      alert("✅ Dossier CE créé avec succès.");
      resetForm();
    } catch (error) {
      console.error("🚨 Erreur création dossier CE :", error);
      alert("Erreur création du dossier.");
    }
  };

  const validateFields = () => {
    if (!orderName) return alert("Numéro de dossier manquant.");
    if (!selectedRevendeur) return alert("Sélectionnez un destinataire.");
    if (!selectedProducts.length) return alert("Ajoutez un produit.");
    if (!deliveryDate) return alert("Date de livraison manquante.");
    if (!conformiteFile) return alert("Ajoutez le PDF de conformité.");
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
    setConformiteFile(null);
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { productId: "", quantity: 1 }]);
  };

  const updateProduct = (index, key, value) => {
    const updated = [...selectedProducts];
    updated[index][key] = value;
    setSelectedProducts(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-darkBlue mb-6">
        CRÉATION D'UN DOSSIER CE
      </h1>

      <form
        onSubmit={handleCreateOrder}
        className="bg-white shadow-lg rounded-lg p-8 max-w-5xl mx-auto space-y-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Numéro du dossier"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            className="p-3 border rounded"
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
          >
            <option value="">-- Choisir le destinataire --</option>
            <optgroup label="Revendeurs">
              {revendeurs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.company}
                </option>
              ))}
            </optgroup>
            <optgroup label="Carrossiers">
              {carrossiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company}
                </option>
              ))}
            </optgroup>
          </select>

          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="p-3 border rounded"
          />
          <input
            type="date"
            value={serviceDate}
            disabled
            className="p-3 border rounded bg-gray-100"
          />
        </div>

        {/* Produits */}
        <div>
          <h2 className="font-bold text-lg mb-2">PRODUITS</h2>
          {selectedProducts.map((product, index) => (
            <div
              key={index}
              className="grid grid-cols-3 gap-4 items-center mb-2"
            >
              <select
                value={product.productId}
                onChange={(e) =>
                  updateProduct(index, "productId", e.target.value)
                }
                className="p-3 border rounded"
              >
                <option value="">-- Produit --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={product.quantity}
                onChange={(e) =>
                  updateProduct(index, "quantity", parseInt(e.target.value))
                }
                className="p-3 border rounded"
              />
              <button
                type="button"
                onClick={() =>
                  setSelectedProducts(
                    selectedProducts.filter((_, i) => i !== index)
                  )
                }
                className="text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addProduct}
            className="text-blue-600 font-bold mt-2"
          >
            + Ajouter un produit
          </button>
        </div>

        {/* Upload PDF */}
        <div>
          <h2 className="font-bold text-lg mb-2">Pièce jointe</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setConformiteFile(e.target.files[0])}
            className="p-2 border rounded"
          />
          {conformiteFile && (
            <p className="text-green-600 mt-2">✅ {conformiteFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
        >
          VALIDER LE DOSSIER
        </button>
      </form>
    </div>
  );
};

export default FitCreateOrder;
