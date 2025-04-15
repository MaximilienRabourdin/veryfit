import React, { useState } from "react";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { app } from "../../firebaseConfig";

const FormulaireTypeA = ({ produit, orderId, index, onNext }) => {
  const db = getFirestore(app);

  const [formData, setFormData] = useState({
    verificateur: { Nom: "", Adresse: "", Contact: "", DateVerification: "" },
    client: { Nom: "", Adresse: "", Contact: "" },
    vehicule: {
      Type: "",
      NumeroImmatriculation: "",
      MarqueCaisse: "",
      NumeroIdentificationCaisse: "",
    },
    porte: { NumeroSerie: "" },
    controles: {
      tablier: {},
      rails: {},
      ressorts: {},
      cadreArriere: {},
      systemeCleverSAFE: {},
      relevesMesures: {
        pression: "",
        montee: "",
        descente: "",
        batterie: "",
      },
    },
  });

  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleControleChange = (controle, field, value) => {
    setFormData((prev) => ({
      ...prev,
      controles: {
        ...prev.controles,
        [controle]: {
          ...prev.controles[controle],
          [field]: value,
        },
      },
    }));
  };

  const renderRadioGroup = (controle, field) => (
    <div className="flex gap-4">
      {["O", "So", "N"].map((opt) => (
        <label key={`${controle}-${field}-${opt}`} className="flex items-center gap-2">
          <input
            type="radio"
            name={`${controle}_${field}_${index}`}
            value={opt}
            checked={formData.controles[controle]?.[field] === opt}
            onChange={() => handleControleChange(controle, field, opt)}
          />
          {opt}
        </label>
      ))}
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderRef = doc(db, "dossiers", orderId);
      const snap = await getDoc(orderRef);
      const dossier = snap.data();

      if (!dossier || !Array.isArray(dossier.produits)) {
        throw new Error("Produits introuvables dans le dossier.");
      }

      const updatedProduits = [...dossier.produits];
      updatedProduits[index] = {
        ...updatedProduits[index],
        filled: true,
        formulaireData: formData,
      };

      const allFilled = updatedProduits.every((p) => p.filled);

      const updatedDossier = {
        ...dossier,
        produits: updatedProduits,
        status: allFilled ? "validé" : dossier.status,
      };

      await updateDoc(orderRef, updatedDossier);

      if (allFilled) {
        const newOrder = {
          ...updatedDossier,
          referenceNumber: dossier.orderName || "Dossier sans nom",
          date: new Date().toISOString(),
          createdAt: new Date(),
        };

        await setDoc(doc(db, "orders", orderId), newOrder);
        console.log("✅ Dossier transféré à FIT dashboard.");
      }
      // 👇 AJOUTE CES 2 LIGNES
await fetch(`/api/dossiers/generate/declaration-ce/${orderId}/${produit.productId}`);
await fetch(`/api/dossiers/generate/declaration-montage/${orderId}/${produit.productId}`);


      alert("✅ Formulaire Type A enregistré !");
      onNext();
    } catch (error) {
      console.error("Erreur :", error);
      alert("❌ Erreur d'enregistrement !");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-8"
    >
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Formulaire - {produit.name}
      </h2>

      {/* Vérificateur */}
      <section>
        <h3 className="font-semibold mb-2">1. Identification du vérificateur</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Nom" value={formData.verificateur.Nom} onChange={(e) => handleChange("verificateur", "Nom", e.target.value)} className="input" />
          <input placeholder="Adresse" value={formData.verificateur.Adresse} onChange={(e) => handleChange("verificateur", "Adresse", e.target.value)} className="input" />
          <input placeholder="Contact" value={formData.verificateur.Contact} onChange={(e) => handleChange("verificateur", "Contact", e.target.value)} className="input" />
          <input type="date" value={formData.verificateur.DateVerification} onChange={(e) => handleChange("verificateur", "DateVerification", e.target.value)} className="input" />
        </div>
      </section>

      {/* Client */}
      <section>
        <h3 className="font-semibold mb-2">2. Client final ou livré</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input placeholder="Nom" value={formData.client.Nom} onChange={(e) => handleChange("client", "Nom", e.target.value)} className="input" />
          <input placeholder="Adresse" value={formData.client.Adresse} onChange={(e) => handleChange("client", "Adresse", e.target.value)} className="input" />
          <input placeholder="Contact" value={formData.client.Contact} onChange={(e) => handleChange("client", "Contact", e.target.value)} className="input" />
        </div>
      </section>

      {/* Véhicule */}
      <section>
        <h3 className="font-semibold mb-2">3. Informations véhicule</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <select value={formData.vehicule.Type} onChange={(e) => handleChange("vehicule", "Type", e.target.value)} className="input">
            <option value="">Type</option>
            <option value="Porteur">Porteur</option>
            <option value="Semi">Semi</option>
            <option value="Autre">Autre</option>
          </select>
          <input placeholder="N° immatriculation" value={formData.vehicule.NumeroImmatriculation} onChange={(e) => handleChange("vehicule", "NumeroImmatriculation", e.target.value)} className="input" />
          <input placeholder="Marque caisse" value={formData.vehicule.MarqueCaisse} onChange={(e) => handleChange("vehicule", "MarqueCaisse", e.target.value)} className="input" />
          <input placeholder="N° identification caisse" value={formData.vehicule.NumeroIdentificationCaisse} onChange={(e) => handleChange("vehicule", "NumeroIdentificationCaisse", e.target.value)} className="input" />
        </div>
      </section>

      {/* Porte */}
      <section>
        <h3 className="font-semibold mb-2">4. Porte</h3>
        <input placeholder="N° de série de la porte" value={formData.porte.NumeroSerie} onChange={(e) => handleChange("porte", "NumeroSerie", e.target.value)} className="input w-full" />
      </section>

      {/* Contrôles 5 à 9 */}
      {[
        { key: "tablier", label: "5. Contrôles tablier", champs: ["A - Roulettes", "B - Bras", "C - Excentriques"] },
        { key: "rails", label: "6. Contrôles rails", champs: ["A - Fixations", "B - Jonctions", "C - Alignement"] },
        { key: "ressorts", label: "7. Contrôles ressorts", champs: ["A - Goupilles", "B - Câbles", "C - Sécurité"] },
        { key: "cadreArriere", label: "8. Cadre arrière", champs: ["A - Équerrage", "B - Parallélisme"] },
        { key: "systemeCleverSAFE", label: "9. Système Clever SAFE", champs: ["A - Vérin", "B - Descente", "C - Serrage"] },
      ].map(({ key, label, champs }) => (
        <section key={key}>
          <h3 className="font-semibold mb-2">{label}</h3>
          <div className="space-y-2">
            {champs.map((champ, i) => (
              <div key={`${key}-${champ}-${i}`} className="flex justify-between items-center">
                <span>{champ}</span>
                {renderRadioGroup(key, champ)}
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Relevés & mesures */}
      <section>
        <h3 className="font-semibold mb-2">10. Relevés & mesures</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {["pression", "montee", "descente", "batterie"].map((field) => (
            <input
              key={`mesures-${field}`}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={formData.controles.relevesMesures[field]}
              onChange={(e) => handleControleChange("relevesMesures", field, e.target.value)}
              className="input"
            />
          ))}
        </div>
      </section>

      <div className="text-right pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Enregistrer et passer au suivant
        </button>
      </div>
    </form>
  );
};

export default FormulaireTypeA;
