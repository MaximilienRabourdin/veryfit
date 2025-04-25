import React, { useState } from 'react';

const FormulaireControlePeriodiqueTypeB = ({ produit }) => {
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

  const sections = [
    {
      num: 1,
      title: 'Contrôles tablier (tous)',
      champs: [
        { code: 'A', label: 'Aspect général' },
        { code: 'B', label: 'Section basse' },
        { code: 'C', label: 'Sections intermédiaires' },
        { code: 'D', label: 'Section haute' },
        { code: 'E', label: 'Roulettes FIT Max (Vanté)' },
        { code: 'F', label: 'Bras haut roulettes FIT X-Trem (Bleu) - si concerné' },
        { code: 'G', label: 'Roulettes FIT X-Trem (Bleu) - si concerné' },
        { code: 'H', label: 'Ressort de calage roulettes FIT X-Trem (Bleu) - si concerné' },
        { code: 'I', label: 'Excentrique' },
        { code: 'J', label: 'Serrage vis des écrous' },
        { code: 'K', label: 'Axes des charnières' },
        { code: 'L', label: 'Joints latéraux' },
        { code: 'M', label: 'Plaque de firme avec QR code' },
        { code: 'N', label: 'Sticker sécurité section basse' },
        { code: 'O', label: 'Plaque CE sur section haute côté intérieur' },
        { code: 'P', label: 'Charnières' },
        { code: 'Q', label: 'Charnière support' },
        { code: 'R', label: 'Fermeture' },
        { code: 'S', label: 'Verrouillage' },
        { code: 'T', label: 'Poignée de levage' },
        { code: 'U', label: 'Dragonne' },
        { code: 'V', label: 'Joint haut' },
        { code: 'W', label: 'Joints latéraux' }
      ]
    },
    {
      num: 2,
      title: 'Contrôles rails',
      champs: [
        { code: 'A', label: 'Aspect général' },
        { code: 'B', label: 'Jonction rails horizontaux/verticaux (continue)' },
        { code: 'C', label: 'Fixation rails' },
        { code: 'D', label: 'Parallélisme des rails entre côté chauffeur et passager' },
        { code: 'E', label: 'Fixation double rails (VAT uniquement)' }
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
        { code: 'C', label: 'Parois latérales' }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Formulaire Contrôle Périodique (Type B)</h2>
      {sections.map(s => renderSection(s.num, s.title, s.champs))}

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

export default FormulaireControlePeriodiqueTypeB;
