
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
    caisse: {
      parodies: {
        bois: false,
        isolees: false,
      },
      typePavillon: {
        translucide: false,
        isole: false,
      },
    },
    cleverSafe: {},
    mesures: {
      pression: "",
      montee: "",
      descente: "",
      fuite: false,
      batterie: "",
    },
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

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderCheckRow = (section, label, field) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <label>{label}</label>
      {["O", "So", "N"].map((v) => (
        <label key={v} className="flex items-center gap-2">
          <input
            type="radio"
            name={`${section}-${field}`}
            checked={formData[section]?.[field] === v}
            onChange={() => handleChange(section, field, v)}
          />
          {v}
        </label>
      ))}
    </div>
  );

  const renderCheckbox = (section, group, field, label) => (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={formData[section]?.[group]?.[field] || false}
        onChange={(e) => handleNestedChange(section, group, field, e.target.checked)}
      />
      {label}
    </label>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const orderRef = doc(db, "dossiers", orderId);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) throw new Error("Dossier introuvable");

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
      }

      alert("✅ Formulaire Type B enregistré !");
      onNext();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);
      alert("Erreur d'enregistrement.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-sm">
      {/* IDENTIFICATION, CLIENT, VEHICULE, PORTE, CAISSE */}
      <div className="bg-white p-4 rounded shadow">

      <section>
  <h3 className="font-semibold mb-2">1. Identification du vérificateur</h3>
  <div className="grid md:grid-cols-2 gap-4">
    <input
      placeholder="Nom"
      name="verifierName"
      value={formData.verifierName}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="Adresse"
      name="verifierAddress"
      value={formData.verifierAddress}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="Contact"
      name="verifierContact"
      value={formData.verifierContact}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      type="date"
      name="verificationDate"
      value={formData.verificationDate}
      onChange={handleBasicChange}
      className="input"
    />
  </div>
</section>

<section>
  <h3 className="font-semibold mb-2">2. Client final ou livré</h3>
  <div className="grid md:grid-cols-2 gap-4">
    <input
      placeholder="Nom"
      name="clientName"
      value={formData.clientName}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="Adresse"
      name="clientAddress"
      value={formData.clientAddress}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="Contact"
      name="clientContact"
      value={formData.clientContact}
      onChange={handleBasicChange}
      className="input"
    />
  </div>
</section>

<section>
  <h3 className="font-semibold mb-2">3. Informations véhicule</h3>
  <div className="grid md:grid-cols-2 gap-4">
    <select
      name="vehicleType"
      value={formData.vehicleType}
      onChange={handleBasicChange}
      className="input"
    >
      <option value="">Type</option>
      <option value="Porteur">Porteur</option>
      <option value="Semi">Semi</option>
      <option value="Autre">Autre</option>
    </select>
    <input
      placeholder="N° immatriculation"
      name="vehicleRegistration"
      value={formData.vehicleRegistration}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="Marque de la caisse"
      name="vehicleBrand"
      value={formData.vehicleBrand}
      onChange={handleBasicChange}
      className="input"
    />
    <input
      placeholder="N° identification caisse"
      name="vehicleBoxId"
      value={formData.vehicleBoxId}
      onChange={handleBasicChange}
      className="input"
    />
  </div>
</section>

<section>
  <h3 className="font-semibold mb-2">4. Porte</h3>
  <input
    placeholder="N° de série"
    name="doorSerial"
    value={formData.doorSerial}
    onChange={handleBasicChange}
    className="input w-full"
  />
</section>

<section className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">5. Contrôles tablier</h3>

  {[
    ["A", "Calage des roulettes"],
    ["B", "Roulettes FIT Max (Verte)"],
    ["C", "Bras haut roulettes FIT X-Trem (Bleu)"],
    ["D", "Roulettes Fit X-Trem (bleu)"],
    ["E", "Ressort de calage pour roulette Fit X-trem (bleu)"],
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
      <span>{code} - {label}</span>
      {["O", "So", "N"].map((v) => (
        <label key={v} className="flex items-center gap-2">
          <input
            type="radio"
            name={`tablier-${code}`}
            checked={formData.tablier?.[code] === v}
            onChange={() => handleChange("tablier", code, v)}
          />
          {v}
        </label>
      ))}
    </div>
  ))}
</section>

<section className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">6. Contrôles rails</h3>

  {/* A */}
  <div className="grid grid-cols-4 items-center gap-4">
    <span>A - Jonction rails horizontaux/verticaux (continue)</span>
    {["O", "So", "N"].map((v) => (
      <label key={v} className="flex items-center gap-2">
        <input
          type="radio"
          name={`rails-A`}
          checked={formData.rails?.A === v}
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
            checked={formData.rails?.B?.[method] || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rails: {
                  ...prev.rails,
                  B: {
                    ...prev.rails?.B,
                    [method]: e.target.checked,
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
            checked={formData.rails?.["B-val"] === v}
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
            checked={formData.rails?.C?.[method] || false}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                rails: {
                  ...prev.rails,
                  C: {
                    ...prev.rails?.C,
                    [method]: e.target.checked,
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
            checked={formData.rails?.["C-val"] === v}
            onChange={() => handleChange("rails", "C-val", v)}
          />
          {v}
        </label>
      ))}
    </div>
  </div>

  {/* D - Cote entre les rails horizontal chauffeur et le pavillon */}
  <div className="mb-2">
    <label className="block mb-1">D - Cote entre les rails horizontal chauffeur et le pavillon (mm)</label>
    <input
      type="text"
      value={formData.rails?.D || ""}
      onChange={(e) => handleChange("rails", "D", e.target.value)}
      className="input"
    />
  </div>

  {/* E - Cote entre les rails horizontal passager et le pavillon */}
  <div className="mb-2">
    <label className="block mb-1">E - Cote entre les rails horizontal passager et le pavillon (mm)</label>
    <input
      type="text"
      value={formData.rails?.E || ""}
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
          name={`rails-F`}
          checked={formData.rails?.F === v}
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
          name={`rails-G`}
          checked={formData.rails?.G === v}
          onChange={() => handleChange("rails", "G", v)}
        />
        {v}
      </label>
    ))}
  </div>
</section>


<section className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">7. Contrôles ressorts</h3>

  {/* A à F avec O / So / N */}
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
            checked={formData.ressorts?.[key] === v}
            onChange={() => handleChange("ressorts", key, v)}
          />
          {v}
        </label>
      ))}
    </div>
  ))}

  {/* G - Tension (Nombre de tours) */}
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

<section className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">8. Caisse / Cadre arrière</h3>

  {/* A - Équerrage cadre arrière */}
  <div className="grid grid-cols-4 items-center gap-4">
    <span>A - Équerrage cadre arrière</span>
    {["O", "So", "N"].map((v) => (
      <label key={`equerrage-${v}`} className="flex items-center gap-2">
        <input
          type="radio"
          name="cadreArriere-equerrage"
          checked={formData.cadreArriere?.equerrage === v}
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
          checked={formData.cadreArriere?.parallelisme === v}
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
          checked={formData.cadreArriere?.parodies?.bois || false}
          onChange={(e) =>
            handleNestedChange("cadreArriere", "parodies", "bois", e.target.checked)
          }
        />
        Bois
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.cadreArriere?.parodies?.isolees || false}
          onChange={(e) =>
            handleNestedChange("cadreArriere", "parodies", "isolees", e.target.checked)
          }
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
          checked={formData.cadreArriere?.pavillon?.translucide || false}
          onChange={(e) =>
            handleNestedChange("cadreArriere", "pavillon", "translucide", e.target.checked)
          }
        />
        Translucide
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.cadreArriere?.pavillon?.isole || false}
          onChange={(e) =>
            handleNestedChange("cadreArriere", "pavillon", "isole", e.target.checked)
          }
        />
        Isolé
      </label>
    </div>
  </div>
</section>

<section className="bg-white p-4 rounded shadow">
  <h3 className="text-lg font-semibold mb-2">9. Système Clever SAFE</h3>

  {[
    { key: "a", label: "A - Plaque CE intérieur coffret" },
    { key: "b", label: "B - Fixation du vérin" },
    { key: "c", label: "C - Test commande extérieure montée" },
    { key: "d", label: "D - Test commande extérieure descente" },
    { key: "e", label: "E - Test commande Safe On/Off" },
    { key: "f", label: "F - Test montée par impulsion (option)" },
    { key: "g", label: "G - Test commande intérieure caisse montée" },
    { key: "h", label: "H - Position du vérin par rapport au cadre" },
    { key: "i", label: "I - Contrôle position alignement du vérin" },
    { key: "j", label: "J - Serrage embase" },
    { key: "k", label: "K - Serrage chape" },
    { key: "l", label: "L - Serrage barre de liaison et contre écrou" },
    { key: "m", label: "M - Renfort sur section haute" },
    { key: "n", label: "N - Fixation coffret de commande" },
    { key: "o", label: "O - Fusible de protection batterie" },
    { key: "p", label: "P - Buzzer porte ouverte" },
    { key: "q", label: "Q - Capteur de fin de course porte ouverte" },
  ].map(({ key, label }) => (
    <div key={key} className="grid grid-cols-4 items-center gap-4 mb-2">
      <span>{label}</span>
      {["O", "So", "N"].map((v) => (
        <label key={v} className="flex items-center gap-2">
          <input
            type="radio"
            name={`cleverSafe-${key}`}
            checked={formData.cleverSafe?.[key] === v}
            onChange={() => handleChange("cleverSafe", key, v)}
          />
          {v}
        </label>
      ))}
    </div>
  ))}
</section>

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
      placeholder="Tension à la batterie"
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
      </div>


      <div className="text-right pt-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default FormulaireTypeB;
