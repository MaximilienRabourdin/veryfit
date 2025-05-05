import React, { useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
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

      // 🔔 Ajout dans la collection notifications
      await addDoc(collection(db, "notifications"), {
        message: `📄 Formulaire rempli pour le produit "${produit.name}" dans le dossier "${orderId}".`,
        createdAt: serverTimestamp(),
        type: "formulaire",
        orderId: orderId,
        produitId: produit.productId,
      });

      // 🔔 Appel backend API (optionnel si utile pour email / logs)
      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "formulaire_rempli",
          dossierId: orderId,
          produitId: produit.productId,
          produitName: produit.name,
          destinataireType: dossier.destinataire_type,
        }),
      });

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
      }

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
    <form onSubmit={handleSubmit} className="space-y-8 text-sm bg-white p-6 rounded shadow max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Formulaire Type B – {produit.name}
      </h2>

      <section>
        <h3 className="font-semibold mb-2">1. Identification du vérificateur</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="verifierName" value={formData.verifierName} onChange={handleBasicChange} placeholder="Nom" className="input" />
          <input name="verifierAddress" value={formData.verifierAddress} onChange={handleBasicChange} placeholder="Adresse" className="input" />
          <input name="verifierContact" value={formData.verifierContact} onChange={handleBasicChange} placeholder="Contact" className="input" />
          <input name="verificationDate" type="date" value={formData.verificationDate} onChange={handleBasicChange} className="input" />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Client final ou livré</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="clientName" value={formData.clientName} onChange={handleBasicChange} placeholder="Nom" className="input" />
          <input name="clientAddress" value={formData.clientAddress} onChange={handleBasicChange} placeholder="Adresse" className="input" />
          <input name="clientContact" value={formData.clientContact} onChange={handleBasicChange} placeholder="Contact" className="input" />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Véhicule</h3>
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
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Porte</h3>
        <input name="doorSerial" value={formData.doorSerial} onChange={handleBasicChange} placeholder="N° de série" className="input w-full" />
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Contrôles tablier</h3>
        {["a", "b", "c", "d", "e"].map((field) => renderCheckRow("tablier", `Champ ${field.toUpperCase()}`, field))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Contrôles rails</h3>
        {["a", "b", "c", "d", "e"].map((field) => renderCheckRow("rails", `Champ ${field.toUpperCase()}`, field))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Contrôles ressorts</h3>
        {["a", "b", "c"].map((field) => renderCheckRow("ressorts", `Champ ${field.toUpperCase()}`, field))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">8. Caisse</h3>
        {["a", "b"].map((field) => renderCheckRow("caisse", `Champ ${field.toUpperCase()}`, field))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">9. Clever SAFE</h3>
        {["a", "b", "c", "d", "e"].map((field) => renderCheckRow("cleverSafe", `Champ ${field.toUpperCase()}`, field))}
      </section>

      <section>
        <h3 className="font-semibold mb-2">10. Relevés & mesures</h3>
        <div className="grid grid-cols-2 gap-4">
          <input name="pression" placeholder="Pression (bars)" value={formData.mesures.pression || ""} onChange={(e) => handleChange("mesures", "pression", e.target.value)} className="input" />
          <input name="montee" placeholder="Temps montée (s)" value={formData.mesures.montee || ""} onChange={(e) => handleChange("mesures", "montee", e.target.value)} className="input" />
          <input name="descente" placeholder="Temps descente (s)" value={formData.mesures.descente || ""} onChange={(e) => handleChange("mesures", "descente", e.target.value)} className="input" />
          <input name="batterie" placeholder="Tension batterie (V)" value={formData.mesures.batterie || ""} onChange={(e) => handleChange("mesures", "batterie", e.target.value)} className="input" />
        </div>
      </section>

      <div className="text-right pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Enregistrer le formulaire
        </button>
      </div>
    </form>
  );
};

export default FormulaireTypeB;
