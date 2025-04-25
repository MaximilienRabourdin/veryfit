import React, { useState } from 'react';

const FormulaireControlePeriodiqueTypeA = ({ produit }) => {
  const [formData, setFormData] = useState({});
  const [remarques, setRemarques] = useState({
    defautMajeur: '',
    defautMineur: '',
    remarque: ''
  });

  const handleChange = (section, champ, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [champ]: value
      }
    }));
  };

  const renderRadio = (section, champ) => (
    <div className="flex gap-4">
      {['O', 'So', 'N'].map(val => (
        <label key={val} className="flex items-center gap-1">
          <input
            type="radio"
            name={`${section}-${champ}`}
            value={val}
            checked={formData[section]?.[champ] === val}
            onChange={() => handleChange(section, champ, val)}
          />
          {val}
        </label>
      ))}
    </div>
  );

  const renderSection = (sectionNum, title, champs) => (
    <div className="mb-6 border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">{sectionNum}/ {title}</h3>
      <div className="space-y-3">
        {champs.map(({ code, label }) => (
          <div key={code} className="flex justify-between items-center">
            <span className="w-2/3">{code} - {label}</span>
            {renderRadio(sectionNum, code)}
          </div>
        ))}
      </div>
    </div>
  );

  // === Données par section ===
  const sections = [
    {
      num: 1,
      title: 'Contrôles tablier (tous)',
      champs: [
        { code: 'A', label: 'Aspect général' },
        { code: 'B', label: 'Section basse' },
        { code: 'C', label: 'Sections intermédiaires' },
        { code: 'D', label: 'Section haute' },
        { code: 'E', label: 'Roulettes' },
        { code: 'F', label: 'Calage des roulettes' },
        { code: 'G', label: 'Charnières centrales' },
        { code: 'H', label: 'Charnières support roulette' },
        { code: 'I', label: 'Profils charnières continues (si porte CC)' },
        { code: 'J', label: 'Bras haut' },
        { code: 'K', label: 'Attaches câble' },
        { code: 'L', label: 'Fermeture' },
        { code: 'M', label: 'Vérouillage' },
        { code: 'N', label: 'Poignée de levage' },
        { code: 'O', label: 'Dragonne' },
        { code: 'P', label: 'Joint haut' },
        { code: 'Q', label: 'Joints latéraux' },
        { code: 'R', label: 'Plaque CE sur section haute (si concerné)' }
      ]
    },
    {
      num: 2,
      title: 'Contrôles rails (tous)',
      champs: [
        { code: 'A', label: 'Aspect général' },
        { code: 'B', label: 'Jonction rails horizontaux/verticaux (continue)' },
        { code: 'C', label: 'Fixation rails' },
        { code: 'D', label: 'Parallélisme des rails côté chauffeur et passager' },
        { code: 'E', label: 'Fixation doubles rails (VAT uniquement)' }
      ]
    },
    {
      num: 3,
      title: 'Ressorts (sauf VAT)',
      champs: [
        { code: 'A', label: 'Aspect général' },
        { code: 'B', label: 'État arbre' },
        { code: 'C', label: 'Goupilles arbre ressort' },
        { code: 'D', label: 'Serrage pièces d\'immobilisation' },
        { code: 'E', label: 'Serrage support central' },
        { code: 'F', label: 'Position des câbles' },
        { code: 'G', label: 'Tension' }
      ]
    },
    {
      num: 4,
      title: 'Caisse / Cadre arrière',
      champs: [
        { code: 'A', label: 'Équerrage cadre arrière' },
        { code: 'B', label: 'Parallélisme' },
        { code: 'C', label: 'Parois latérales' },
        { code: 'D', label: 'Type de pavillon' }
      ]
    },
    {
      num: 5,
      title: 'Système Clever SAFE',
      champs: [
        { code: 'A', label: 'État général' },
        { code: 'B', label: 'Plaque CE intérieur coffret' },
        { code: 'C', label: 'Fixation du vérin' },
        { code: 'D', label: 'Test commande extérieure montée' },
        { code: 'E', label: 'Test commande extérieure descente' },
        { code: 'F', label: 'Test commande Safe On/Off' },
        { code: 'G', label: 'Test montée par impulsion' },
        { code: 'H', label: 'Test commande intérieure caisse montée' },
        { code: 'I', label: 'Position du vérin par rapport au cadre' },
        { code: 'J', label: 'Contrôle position alignement vérin' },
        { code: 'K', label: 'Serrage embase + axe' },
        { code: 'L', label: 'Serrage chape + axe' }
      ]
    },
    {
      num: 6,
      title: 'Système vérin à tige (VAT)',
      champs: [
        { code: 'A', label: 'État général' },
        { code: 'B', label: 'Fixation du vérin' },
        { code: 'C', label: 'Test commande extérieure montée' },
        { code: 'D', label: 'Test commande extérieure descente' },
        { code: 'E', label: 'Test commande On/Off' },
        { code: 'F', label: 'Test commande intérieure caisse descente' }
      ]
    },
    {
      num: 7,
      title: 'Relevés, mesures et contrôles',
      champs: [
        { code: 'A', label: 'Déclenchement sécurité SAFE' },
        { code: 'B', label: 'Fluidité du cycle montée' },
        { code: 'C', label: 'Fluidité du cycle descente' },
        { code: 'D', label: 'Pression coffret de commande' },
        { code: 'E', label: 'Temps de cycle montée' },
        { code: 'F', label: 'Temps de cycle descente' },
        { code: 'G', label: 'Fuites' },
        { code: 'H', label: 'Tension à la batterie' }
      ]
    }
  ];

  const isCleverSafe = produit.nom.includes('SAFE');

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Formulaire Contrôle Périodique (Type A)</h2>
      {sections.slice(0, 4).map(s => renderSection(s.num, s.title, s.champs))}
      {isCleverSafe
        ? renderSection(sections[4].num, sections[4].title, sections[4].champs) // 5
        : renderSection(sections[5].num, sections[5].title, sections[5].champs) // 6
      }
      {renderSection(sections[6].num, sections[6].title, sections[6].champs)} {/* 7 */}

      {/* Bloc remarques */}
      <div className="border rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-lg">Commentaires</h3>
        <div>
          <label className="block font-medium">Défaut majeur :</label>
          <input
            type="text"
            className="w-full border px-3 py-1 rounded"
            value={remarques.defautMajeur}
            onChange={e => setRemarques({ ...remarques, defautMajeur: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-medium">Défaut mineur :</label>
          <input
            type="text"
            className="w-full border px-3 py-1 rounded"
            value={remarques.defautMineur}
            onChange={e => setRemarques({ ...remarques, defautMineur: e.target.value })}
          />
        </div>
        <div>
          <label className="block font-medium">Remarque :</label>
          <textarea
            className="w-full border px-3 py-1 rounded"
            value={remarques.remarque}
            onChange={e => setRemarques({ ...remarques, remarque: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default FormulaireControlePeriodiqueTypeA;
