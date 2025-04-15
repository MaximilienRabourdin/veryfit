import React, { useState } from "react";

const ControlePeriodiqueForm = () => {
  const [formData, setFormData] = useState({
    prestataire: "",
    adresse: "",
    contactPrestataire: "",
    coordonneesUtilisateur: "",
    contactUtilisateur: "",
    coordonneesLoueur: "",
    contactLoueur: "",
    vehiculeType: "",
    immatriculation: "",
    marqueCaisse: "",
    porteMarque: "",
    porteNumeroSerie: "",
    typeBois: "",
    manoeuvreType: "",
    remarques: "",
    date: "",
    reference: "",
    verificateur: "",
    signature: "",
    documentsReglementaires: {
      plaqueFirme: false,
      plaqueCE: false,
      stickerInterieur: false,
      stickerExterieur: false,
    },
    controles: {
      tablier: [
        "Propreté",
        "Aspect général",
        "Section basse",
        "Fermeture",
        "Verrouillage",
        "Poignée de levage",
        "Dragonne",
        "Attache câble",
        "Sections intermédiaires",
        "Section haute",
        "Calage",
        "Roulette",
        "Supports de roulettes",
        "Charnières intermédiaires",
        "Profils charnières continues",
        "Bras hauts",
        "Joint haut",
        "Joints latéraux",
      ],
      rails: [
        "Propreté",
        "Aspect général et fixation",
        "Fixation rails verticaux",
        "Fixation rails horizontaux",
        "Jonction rails horizontaux/verticaux",
        "Alignement latéral",
        "Alignement horizontal",
        "Fixation doubles rails uniquement VAT",
        "Lubrification (Ne pas utiliser de graisse)",
      ],
      ressorts: [
        "Propreté",
        "Ressorts chauffeur",
        "Ressort passager",
        "Câbles",
        "Attaches câbles",
        "Axes",
        "Goupilles",
        "Position des câbles",
        "Tension",
      ],
      cadre: [
        "État général",
        "Équerrage",
        "Partie basse (Chocs, Fissures, réparations)",
        "Partie haute (Chocs, Fissures, réparations)",
        "Partie latérale (Chocs, Fissures, réparations)",
      ],
      verinTige: [
        "État général",
        "Fixation",
        "Tension de la batterie",
        "Commande extérieure montée",
        "Commande extérieure descente",
        "Commande intérieure caisse montée",
        "Commande intérieure caisse descente",
        "Montée par impulsion (option)",
        "Racleur de tige",
        "Joint de tête",
        "Joint de piston",
        "Côte à l'axe porte fermée",
        "Côte à l'axe porte ouverte",
        "Serrage pivot",
        "Axe de chape",
        "Coffret de commande",
        "Faisceau alimentation générale",
        "Circuit d'air",
        "Soupape de sécurité",
        "Coupure électrique générale",
      ],
      clever: [
        "État général",
        "Fixation équerres extrémités",
        "Fixation équerres intermédiaires",
        "Tension de la batterie",
        "Commande extérieure montée",
        "Commande extérieure descente",
        "Commande intérieure caisse montée",
        "Commande intérieure caisse descente",
        "Montée par impulsion (option)",
        "Racleurs",
        "Bande extérieure",
        "Bande intérieure (joint d'étanchéité)",
        "Serrage embase",
        "Axe embase",
        "Serrage chape",
        "Axe chape",
        "Barre de liaison",
        "Coffret de commande",
        "Faisceau alimentation générale",
        "Circuit d'air",
        "Renfort sur section haute",
        "Soupape de sécurité",
        "Verrouillage de sécurité SAFE",
        "Coupure électrique générale",
      ],
      mesures: {
        pression: "",
        tempsCycleMontee: "",
        tempsCycleDescente: "",
        fuites: false,
      },
      controlesFinals: {
        fluiditeMontee: "",
        fluiditeDescente: "",
        necessiteReglage: "",
        pointsCorriger: "",
        blocageSAFE: "",
      },
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        documentsReglementaires: {
          ...formData.documentsReglementaires,
          [name]: checked,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Données soumises :", formData);
  };

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contrôle Général Périodique</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identification */}
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold">Identification</h2>
          <input
            type="text"
            name="prestataire"
            placeholder="Identification du prestataire"
            value={formData.prestataire}
            onChange={handleInputChange}
            className="w-full border p-2 rounded mb-2"
          />
          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={formData.adresse}
            onChange={handleInputChange}
            className="w-full border p-2 rounded mb-2"
          />
          {/* Add more fields for contact information */}
        </div>

        {/* Other Sections */}
        <div>
          <h2 className="text-xl font-semibold">Contrôles Tablier</h2>
          {formData.controles.tablier.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <label className="flex-1">{item}</label>
              <input type="radio" name={`tablier-${index}`} value="B" /> B
              <input type="radio" name={`tablier-${index}`} value="So" /> So
              <input type="radio" name={`tablier-${index}`} value="M" /> M
            </div>
          ))}
        </div>

        {/* Repeat similar blocks for Rails, Ressorts, Cadre, etc. */}

        <button
          type="submit"
          className="col-span-1 md:col-span-2 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Soumettre
        </button>
      </form>
    </div>
  );
};

export default ControlePeriodiqueForm;
