import React, { useState } from "react";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const FormulaireTypeB = ({ produit, orderId, index, onNext }) => {
  const db = getFirestore(app);

  const [formData, setFormData] = useState({
    verifierName: "",
    verifierAddress: "",
    verifierContact: "",
    verificationDate: "",
    clientName: "",
    clientAddress: "",
    clientContact: "",
    vehicleType: "",
    vehicleRegistration: "",
    vehicleBrand: "",
    vehicleBoxId: "",
    doorSerial: "",
    tablier: {},
    rails: {},
    ressorts: {},
    caisse: {},
    cleverSafe: {},
    mesures: {},
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    const requiredFields = [
      "verifierName", "verifierAddress", "verifierContact", "verificationDate",
      "clientName", "clientAddress", "clientContact",
      "vehicleType", "vehicleRegistration", "vehicleBrand", "vehicleBoxId", "doorSerial"
    ];

    for (const field of requiredFields) {
      if (!formData[field]) return false;
    }

    const requiredSections = ["tablier", "rails", "ressorts", "caisse", "cleverSafe", "mesures"];
    for (const section of requiredSections) {
      const sectionData = formData[section];
      if (!sectionData || Object.values(sectionData).some((v) => !v)) return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Merci de remplir tous les champs avant de continuer.");
      return;
    }

    try {
      const orderRef = doc(db, "dossiers", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        throw new Error("Dossier introuvable.");
      }

      const dossier = orderSnap.data();
      const produits = dossier.produits || [];

      produits[index] = {
        ...produits[index],
        filled: true,
        formulaire: formData,
      };

      await updateDoc(orderRef, { produits });

      const allFilled = produits.every((p) => p.filled);
      if (allFilled) {
        await updateDoc(orderRef, { status: "validé" });

        const newOrder = {
          ...dossier,
          produits,
          status: "validé",
          date: new Date().toISOString(),
          createdAt: new Date(),
        };

        await setDoc(doc(db, "orders", orderId), newOrder);
        console.log("✅ Dossier transféré à FIT dashboard.");
      }

      await fetch(`/api/dossiers/generate/declaration-ce/${orderId}/${produit.productId}`);
await fetch(`/api/dossiers/generate/declaration-montage/${orderId}/${produit.productId}`);

      alert("✅ Formulaire Type B enregistré !");
      onNext?.();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("Erreur lors de l'enregistrement du formulaire.");
    }
  };

  const renderCheckRow = (section, label, field) => (
    <div className="grid grid-cols-4 items-center gap-4" key={`${section}-${field}`}>
      <label>{label}</label>
      {["O", "So", "N"].map((v) => (
        <label key={`${section}-${field}-${v}`} className="flex items-center gap-2">
          <input
            type="radio"
            name={`${section}-${field}-${index}`}
            checked={formData[section]?.[field] === v}
            onChange={() => handleChange(section, field, v)}
          />
          {v}
        </label>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm">
      {/* IDENTIFICATION */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">1. Identification du vérificateur</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="verifierName" value={formData.verifierName} onChange={handleBasicChange} placeholder="Nom" className="input" />
          <input name="verifierAddress" value={formData.verifierAddress} onChange={handleBasicChange} placeholder="Adresse" className="input" />
          <input name="verifierContact" value={formData.verifierContact} onChange={handleBasicChange} placeholder="Contact" className="input" />
          <input name="verificationDate" type="date" value={formData.verificationDate} onChange={handleBasicChange} className="input" />
        </div>
      </div>

      {/* CLIENT */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">2. Identification client final ou livré</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="clientName" value={formData.clientName} onChange={handleBasicChange} placeholder="Nom" className="input" />
          <input name="clientAddress" value={formData.clientAddress} onChange={handleBasicChange} placeholder="Adresse" className="input" />
          <input name="clientContact" value={formData.clientContact} onChange={handleBasicChange} placeholder="Contact" className="input" />
        </div>
      </div>

      {/* VEHICULE */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">3. Informations véhicule</h3>
        <div className="grid grid-cols-2 gap-4">
          <select name="vehicleType" value={formData.vehicleType} onChange={handleBasicChange} className="input">
            <option value="">Type</option>
            <option value="Porteur">Porteur</option>
            <option value="Semi">Semi</option>
            <option value="Autre">Autre</option>
          </select>
          <input name="vehicleRegistration" value={formData.vehicleRegistration} onChange={handleBasicChange} placeholder="N° immatriculation" className="input" />
          <input name="vehicleBrand" value={formData.vehicleBrand} onChange={handleBasicChange} placeholder="Marque caisse" className="input" />
          <input name="vehicleBoxId" value={formData.vehicleBoxId} onChange={handleBasicChange} placeholder="N° identification caisse" className="input" />
        </div>
      </div>

      {/* PORTE */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">4. Porte</h3>
        <input name="doorSerial" value={formData.doorSerial} onChange={handleBasicChange} placeholder="N° de série" className="input w-full" />
      </div>

      {/* CONTRÔLES */}
      {[
        { key: "tablier", title: "5. Contrôles tablier", champs: ["a", "b", "c", "d", "e"] },
        { key: "rails", title: "6. Contrôles rails", champs: ["a", "b", "c", "d", "e"] },
        { key: "ressorts", title: "7. Contrôles ressorts", champs: ["a", "b", "c"] },
        { key: "caisse", title: "8. Caisse / Cadre arrière", champs: ["a", "b"] },
        { key: "cleverSafe", title: "9. Système Clever SAFE", champs: ["a", "b", "c", "d", "e"] },
      ].map(({ key, title, champs }) => (
        <div key={key} className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {champs.map((champ, i) => renderCheckRow(key, `Champ ${champ.toUpperCase()}`, champ))}
        </div>
      ))}

      {/* MESURES */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">10. Relevés & mesures</h3>
        <div className="grid grid-cols-2 gap-4">
          {["pression", "montee", "descente", "batterie"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={
                field === "pression" ? "Pression (bars)" :
                field === "montee" ? "Temps montée (s)" :
                field === "descente" ? "Temps descente (s)" :
                "Tension batterie (V)"
              }
              value={formData.mesures?.[field] || ""}
              onChange={(e) => handleChange("mesures", field, e.target.value)}
              className="input"
            />
          ))}
        </div>
      </div>

      {/* SUBMIT */}
      <div className="text-right pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

export default FormulaireTypeB;
