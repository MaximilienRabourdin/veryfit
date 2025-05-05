// frontend/src/pages/fit/FormulaireTypeA.js

import React, { useState } from "react";
import {
  getFirestore,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { app } from "../../firebaseConfig";


const FormulaireTypeA = ({ produit, orderId, index, onNext }) => {
  const db = getFirestore(app);

  // État initial regroupant toutes les sections du formulaire
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
    // La section "controles" regroupe les réponses aux contrôles des différentes parties
    controles: {
      tablier: {},
      rails: {},
      ressorts: {},
      cadreArriere: {},
      systemeCleverSAFE: {},
      relevesMesures: { pression: "", montee: "", descente: "", batterie: "" },
    },
  });

  // Gestion des changements pour les sections simples
  const handleChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  // Gestion des changements pour les sections de contrôles (dans l'objet "controles")
  const handleControleChange = (controle, field, value) => {
    setFormData((prev) => ({
      ...prev,
      controles: {
        ...prev.controles,
        [controle]: { ...prev.controles[controle], [field]: value },
      },
    }));
  };

  // Gestion des changements pour les groupes imbriqués (checkboxes par exemple)
  const handleNestedChange = (section, group, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [group]: {
          ...prev[section][group],
          [field]: value,
        },
      },
    }));
  };

  // Fonction pour afficher un groupe de boutons radio (valeurs "O", "So", "N")
  const renderRadioGroup = (controle, field) => (
    <div className="flex gap-4">
      {["O", "So", "N"].map((opt) => (
        <label key={opt} className="flex items-center gap-2">
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

  // Fonction de soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Référence au dossier dans Firestore
      const orderRef = doc(db, "dossiers", orderId);
      const snap = await getDoc(orderRef);

      if (!snap.exists()) throw new Error("Dossier introuvable");

      const dossier = snap.data();

      // Mise à jour du produit concerné avec les données du formulaire
      const updatedProduits = [...dossier.produits];
      updatedProduits[index] = {
        ...updatedProduits[index],
        filled: true,
        formulaireData: formData,
      };

      // On détermine si tous les produits du dossier ont été remplis
      const allFilled = updatedProduits.every((p) => p.filled);

      // Mise à jour du dossier (statut mis à jour si tous les formulaires sont remplis)
      const updatedDossier = {
        ...dossier,
        produits: updatedProduits,
        status: allFilled ? "validé" : dossier.status,
      };

      await updateDoc(orderRef, updatedDossier);

      await addDoc(collection(db, "notifications"), {
        message: `📄 Formulaire rempli pour le produit "${produit.name}" dans le dossier "${orderId}".`,
        createdAt: serverTimestamp(),
        type: "formulaire",
        orderId: orderId,
        produitId: produit.productId,
      });

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
      

      // Si tous les produits sont remplis, on transfère le dossier vers la collection "orders"
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

      alert("✅ Formulaire Type A enregistré !");
      onNext();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      alert("❌ Erreur d'enregistrement !");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-6 rounded shadow space-y-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">
        Formulaire - {produit.name}
      </h2>

      {/* Section 1 : Identification du vérificateur */}
      <section>
        <h3 className="font-semibold mb-2">1. Identification du vérificateur</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nom"
            value={formData.verificateur.Nom}
            onChange={(e) => handleChange("verificateur", "Nom", e.target.value)}
            className="input"
          />
          <input
            placeholder="Adresse"
            value={formData.verificateur.Adresse}
            onChange={(e) => handleChange("verificateur", "Adresse", e.target.value)}
            className="input"
          />
          <input
            placeholder="Contact"
            value={formData.verificateur.Contact}
            onChange={(e) => handleChange("verificateur", "Contact", e.target.value)}
            className="input"
          />
          <input
            type="date"
            value={formData.verificateur.DateVerification}
            onChange={(e) => handleChange("verificateur", "DateVerification", e.target.value)}
            className="input"
          />
        </div>
      </section>

      {/* Section 2 : Identification client final ou livré */}
      <section>
        <h3 className="font-semibold mb-2">2. Identification du client final ou livré</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nom"
            value={formData.client.Nom}
            onChange={(e) => handleChange("client", "Nom", e.target.value)}
            className="input"
          />
          <input
            placeholder="Adresse"
            value={formData.client.Adresse}
            onChange={(e) => handleChange("client", "Adresse", e.target.value)}
            className="input"
          />
          <input
            placeholder="Contact"
            value={formData.client.Contact}
            onChange={(e) => handleChange("client", "Contact", e.target.value)}
            className="input"
          />
        </div>
      </section>

      {/* Section 3 : Informations véhicule */}
      <section>
        <h3 className="font-semibold mb-2">3. Informations véhicule</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={formData.vehicule.Type}
            onChange={(e) => handleChange("vehicule", "Type", e.target.value)}
            className="input"
          >
            <option value="">Type</option>
            <option value="Porteur">Porteur</option>
            <option value="Semi">Semi</option>
            <option value="Autre">Autre</option>
          </select>
          <input
            placeholder="N° immatriculation"
            value={formData.vehicule.NumeroImmatriculation}
            onChange={(e) => handleChange("vehicule", "NumeroImmatriculation", e.target.value)}
            className="input"
          />
          <input
            placeholder="Marque de la caisse"
            value={formData.vehicule.MarqueCaisse}
            onChange={(e) => handleChange("vehicule", "MarqueCaisse", e.target.value)}
            className="input"
          />
          <input
            placeholder="N° identification caisse"
            value={formData.vehicule.NumeroIdentificationCaisse}
            onChange={(e) => handleChange("vehicule", "NumeroIdentificationCaisse", e.target.value)}
            className="input"
          />
        </div>
      </section>

      {/* Section 4 : Porte */}
      <section>
        <h3 className="font-semibold mb-2">4. Porte</h3>
        <input
          placeholder="N° de série de la porte"
          value={formData.porte.NumeroSerie}
          onChange={(e) => handleChange("porte", "NumeroSerie", e.target.value)}
          className="input w-full"
        />
      </section>

      {/* Section 5 : Contrôles tablier */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">5. Contrôles tablier</h3>
        {[
          ["A", "Calage des roulettes"],
          ["B", "Roulettes FIT Max (Verte)"],
          ["C", "Bras haut roulettes FIT X-Trem (Bleu)"],
          ["D", "Roulettes Fit X-Trem (Bleu)"],
          ["E", "Ressort de calage pour roulette Fit X-Trem (Bleu)"],
          ["F", "Réglage des excentriques"],
          ["G", "Serrage des vis des écrous"],
          ["H", "Axes des charnières"],
          ["I", "Joints latéraux"],
          ["J", "Finition brute"],
          ["K", "Finition peinture"],
          ["L", "Plaque de firme avec QR-Code instruction (face extérieure de la porte)"],
          ["M", "Sticker sécurité section basse"],
          ["O", "Plaque CE sur section haute côté intérieur"],
        ].map(([code, label]) => (
          <div key={code} className="grid grid-cols-4 items-center gap-4">
            <span>{`${code} - ${label}`}</span>
            {["O", "So", "N"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`tablier-${code}`}
                  value={v}
                  checked={formData.controles.tablier?.[code] === v}
                  onChange={() => handleChange("tablier", code, v)}
                />
                {v}
              </label>
            ))}
          </div>
        ))}
      </section>

      {/* Section 6 : Contrôles rails */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">6. Contrôles rails</h3>
        {/* A - Jonction */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span>A - Jonction rails horizontaux/verticaux (continue)</span>
          {["O", "So", "N"].map((v) => (
            <label key={v} className="flex items-center gap-2">
              <input
                type="radio"
                name="rails-A"
                value={v}
                checked={formData.controles.rails?.A === v}
                onChange={() => handleChange("rails", "A", v)}
              />
              {v}
            </label>
          ))}
        </div>

        {/* B - Fixation rails verticaux */}
        <div className="mb-2">
          <span className="block font-semibold mb-1">B - Fixation rails verticaux</span>
          <div className="flex gap-4 flex-wrap">
            {["Rivetage", "Collage", "Vissage"].map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.controles.rails?.B?.[method] || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      controles: {
                        ...prev.controles,
                        rails: {
                          ...prev.controles.rails,
                          B: {
                            ...prev.controles.rails?.B,
                            [method]: e.target.checked,
                          },
                        },
                      },
                    }))
                  }
                />
                {method}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <span>Validation</span>
            {["O", "So", "N"].map((v) => (
              <label key={`B-val-${v}`} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rails-B-validation"
                  value={v}
                  checked={formData.controles.rails?.["B-val"] === v}
                  onChange={() => handleChange("rails", "B-val", v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        {/* C - Fixation rails horizontaux */}
        <div className="mb-2">
          <span className="block font-semibold mb-1">C - Fixation rails horizontaux</span>
          <div className="flex gap-4 flex-wrap">
            {["Rivetage", "Collage", "Vissage"].map((method) => (
              <label key={method} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.controles.rails?.C?.[method] || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      controles: {
                        ...prev.controles,
                        rails: {
                          ...prev.controles.rails,
                          C: {
                            ...prev.controles.rails?.C,
                            [method]: e.target.checked,
                          },
                        },
                      },
                    }))
                  }
                />
                {method}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-4 items-center gap-4 mt-2">
            <span>Validation</span>
            {["O", "So", "N"].map((v) => (
              <label key={`C-val-${v}`} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rails-C-validation"
                  value={v}
                  checked={formData.controles.rails?.["C-val"] === v}
                  onChange={() => handleChange("rails", "C-val", v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>

        {/* D - Côté entre rail et pavillon */}
        <div className="mb-2">
          <label className="block mb-1">D - Côté entre les rails horizontal chauffeur et le pavillon (mm)</label>
          <input
            type="text"
            value={formData.controles.rails?.D || ""}
            onChange={(e) => handleChange("rails", "D", e.target.value)}
            className="input"
          />
        </div>

        {/* E - Côté entre rail horizontal passager et pavillon */}
        <div className="mb-2">
          <label className="block mb-1">E - Côté entre les rails horizontal passager et le pavillon (mm)</label>
          <input
            type="text"
            value={formData.controles.rails?.E || ""}
            onChange={(e) => handleChange("rails", "E", e.target.value)}
            className="input"
          />
        </div>

        {/* F - Parallélisme */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span>F - Parallélisme rails verticaux/horizontaux</span>
          {["O", "So", "N"].map((v) => (
            <label key={v} className="flex items-center gap-2">
              <input
                type="radio"
                name="rails-F"
                value={v}
                checked={formData.controles.rails?.F === v}
                onChange={() => handleChange("rails", "F", v)}
              />
              {v}
            </label>
          ))}
        </div>

        {/* G - Jeu constant porte/rails */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span>G - Jeu constant porte/rails</span>
          {["O", "So", "N"].map((v) => (
            <label key={v} className="flex items-center gap-2">
              <input
                type="radio"
                name="rails-G"
                value={v}
                checked={formData.controles.rails?.G === v}
                onChange={() => handleChange("rails", "G", v)}
              />
              {v}
            </label>
          ))}
        </div>
      </section>

      {/* Section 7 : Contrôles ressorts */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">7. Contrôles ressorts</h3>
        {[
          ["A", "Attaches câbles"],
          ["B", "Goupilles attaches câbles"],
          ["C", "Goupilles arbre ressort"],
          ["D", "Serrage pièces d'immobilisation"],
          ["E", "Serrage support central"],
          ["F", "Position des câbles"],
        ].map(([key, label]) => (
          <div key={key} className="grid grid-cols-4 items-center gap-4">
            <span>{`${key} - ${label}`}</span>
            {["O", "So", "N"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`ressorts-${key}`}
                  value={v}
                  checked={formData.ressorts?.[key] === v}
                  onChange={() => handleChange("ressorts", key, v)}
                />
                {v}
              </label>
            ))}
          </div>
        ))}
        <div className="mt-4">
          <label className="block mb-1">G - Tension (Nombre de tours)</label>
          <input
            type="text"
            value={formData.ressorts?.G || ""}
            onChange={(e) => handleChange("ressorts", "G", e.target.value)}
            className="input"
          />
        </div>
      </section>

      {/* Section 8 : Caisse / Cadre arrière */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">8. Caisse / Cadre arrière</h3>
        {/* A - Équerrage */}
        <div className="grid grid-cols-4 items-center gap-4">
          <span>A - Équerrage cadre arrière</span>
          {["O", "So", "N"].map((v) => (
            <label key={`equerrage-${v}`} className="flex items-center gap-2">
              <input
                type="radio"
                name="cadreArriere-equerrage"
                value={v}
                checked={formData.controles.cadreArriere?.equerrage === v}
                onChange={() => handleChange("cadreArriere", "equerrage", v)}
              />
              {v}
            </label>
          ))}
        </div>

        {/* B - Parallélisme */}
        <div className="grid grid-cols-4 items-center gap-4 mt-4">
          <span>B - Parallélisme</span>
          {["O", "So", "N"].map((v) => (
            <label key={`parallelisme-${v}`} className="flex items-center gap-2">
              <input
                type="radio"
                name="cadreArriere-parallelisme"
                value={v}
                checked={formData.controles.cadreArriere?.parallelisme === v}
                onChange={() => handleChange("cadreArriere", "parallelisme", v)}
              />
              {v}
            </label>
          ))}
        </div>

        {/* C - Parodies latérales */}
        <div className="mt-4">
          <span className="block mb-1">C - Parodies latérales</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.controles.cadreArriere?.parodies?.bois || false}
                onChange={(e) => handleNestedChange("cadreArriere", "parodies", "bois", e.target.checked)}
              />
              Bois
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.controles.cadreArriere?.parodies?.isolees || false}
                onChange={(e) => handleNestedChange("cadreArriere", "parodies", "isolees", e.target.checked)}
              />
              Isolées
            </label>
          </div>
        </div>

        {/* D - Type de pavillon */}
        <div className="mt-4">
          <span className="block mb-1">D - Type de pavillon</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.controles.cadreArriere?.pavillon?.translucide || false}
                onChange={(e) => handleNestedChange("cadreArriere", "pavillon", "translucide", e.target.checked)}
              />
              Translucide
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.controles.cadreArriere?.pavillon?.isole || false}
                onChange={(e) => handleNestedChange("cadreArriere", "pavillon", "isole", e.target.checked)}
              />
              Isolé
            </label>
          </div>
        </div>
      </section>

      {/* Section 9 : Système Clever SAFE */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">9. Système Clever SAFE</h3>
        {[
          { key: "A", label: "A - Plaque CE intérieur coffret" },
          { key: "B", label: "B - Fixation du vérin" },
          { key: "C", label: "C - Test commande extérieure montée" },
          { key: "D", label: "D - Test commande extérieure descente" },
          { key: "E", label: "E - Test commande Safe On/Off" },
          { key: "F", label: "F - Test montée par impulsion (option)" },
          { key: "G", label: "G - Test commande intérieure caisse montée" },
          { key: "H", label: "H - Position du vérin par rapport au cadre" },
          { key: "I", label: "I - Contrôle position alignement du vérin" },
          { key: "J", label: "J - Serrage embase" },
          { key: "K", label: "K - Serrage chape" },
          { key: "L", label: "L - Serrage barre de liaison et contre écrou" },
          { key: "M", label: "M - Renfort sur section haute" },
          { key: "N", label: "N - Fixation coffret de commande" },
          { key: "O", label: "O - Fusible de protection batterie" },
          { key: "P", label: "P - Buzzer porte ouverte" },
          { key: "Q", label: "Q - Capteur de fin de course porte ouverte" },
        ].map(({ key, label }) => (
          <div key={key} className="grid grid-cols-4 items-center gap-4 mb-2">
            <span>{label}</span>
            {["O", "So", "N"].map((v) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`cleverSafe-${key}`}
                  value={v}
                  checked={formData.cleverSafe?.[key] === v}
                  onChange={() => handleChange("cleverSafe", key, v)}
                />
                {v}
              </label>
            ))}
          </div>
        ))}
      </section>

      {/* Section 10 : Relevés & mesures */}
      <section className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">10. Relevés & mesures</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Pression coffret de commande (Bars)"
            value={formData.releves?.pression || ""}
            onChange={(e) => handleChange("releves", "pression", e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Temps de cycle montée (Secondes)"
            value={formData.releves?.montee || ""}
            onChange={(e) => handleChange("releves", "montee", e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Temps de cycle descente (Secondes)"
            value={formData.releves?.descente || ""}
            onChange={(e) => handleChange("releves", "descente", e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Tension à la batterie (Volts)"
            value={formData.releves?.batterie || ""}
            onChange={(e) => handleChange("releves", "batterie", e.target.value)}
            className="input"
          />
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.releves?.fuite || false}
              onChange={(e) => handleChange("releves", "fuite", e.target.checked)}
            />
            Fuites (Vérin) après pulvérisation d’un détecteur de fuites
          </label>
        </div>
      </section>

      {/* Bouton de soumission */}
      <div className="text-right pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Enregistrer et passer au suivant
        </button>
      </div>
    </form>
  );
};

export default FormulaireTypeA;
