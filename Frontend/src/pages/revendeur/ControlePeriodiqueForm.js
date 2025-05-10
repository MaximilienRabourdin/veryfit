// ControlePeriodiqueForm.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";

const getSections = (isRouge, hasCleverSafe) => {
  const tablierVert = [
    "Aspect général", "Section basse", "Sections intermédiaires", "Section haute", "Calage des roulettes",
    "Roulette FIT Max (Verte)", "Bras haut roulettes FIT X-Trem (Bleu) - si concerné", "Roulettes Fit X-Trem (bleu) - si concerné",
    "Ressort de calage pour roulette Fit X-trem (bleu) - si concerné", "Excentriques", "Serrage des vis des écrous",
    "Axes des charnières", "Joints latéraux", "Plaque de firme avec QR-Code instruction (face extérieure de la porte)",
    "Sticker sécurité section basse", "Plaque CE sur section haute côté intérieur", "Charnières", "Charnière support",
    "Fermeture", "Verrouillage", "Poignée de levage", "Dragonne", "Joint haut", "Joints latéraux finaux"
  ];

  const tablierRouge = [
    "Aspect général", "Section basse", "Sections intermédiaires", "Section haute", "Roulette",
    "Calage des roulettes", "Charnières centrales", "Charnières support roulette", "Profils charnières continues (si porte CC)",
    "Bras haut", "Attaches câble", "Fermeture", "Verrouillage", "Poignée de levage", "Dragonne",
    "Joint haut", "Joints latéraux", "Plaque CE sur section haute (si concerné)"
  ];

  const rails = [
    "Aspect général", "Jonction rails horizontaux/verticaux (continue)", "Fixation rails",
    "Parallélisme des rails entre côté chauffeur et passager", "Fixation double rails (VAT uniquement)"
  ];

  const ressorts = [
    "Aspect général", "État arbre", "Goupilles arbre ressort", "Serrage pièces d'immobilisation",
    "Serrage support central", "Position des câbles", "Tension"
  ];

  const cadreVert = [
    "Équerrage cadre arrière", "Parallélisme", "Parois latérales", "Bois", "Isolées",
    "Type de pavillon", "Translucide", "Isolé"
  ];

  const cadreRouge = [
    "Équerrage cadre arrière", "Parallélisme", "Parois latérales"
  ];

  const clever = [
    "État général", "Plaque CE intérieur coffret", "Fixation du vérin", "Test commande extérieure montée",
    "Test commande extérieure descente", "Test commande Safe On/Off", "Test montée par impulsion",
    "Test commande intérieure caisse montée", "Position du vérin par rapport au cadre", "Contrôle position alignement du vérin",
    "Serrage embase + axe", "Serrage chape + axe", "Serrage barre de liaison et contre écrou", "Racleur",
    "Bande extérieure (métallique)", "Bande intérieure (bleue)", "Navette sur vérin", "Capteur de fin de course porte ouverte",
    "Renfort sur section haute", "Coffret de commande", "Fusible de protection batterie", "Buzzer porte ouverte",
    "Capteur de fin de course", "Soupape de sécurité", "Verrouillage sécurité Safe", "Circuit d’air", "Faisceau d’alimentation"
  ];

  const verifs = [
    "Arrêt porte en position haute", "Position correcte des butées",
    "Étiquettes de sécurité présentes", "Fixation correcte des éléments"
  ];

  const mesures = [
    "Déclenchement de la sécurité safe", "Fluidité du cycle de montée",
    "Fluidité du cycle de descente", "Pression coffret de commande (Bars)",
    "Temps de cycle montée (Secondes)", "Temps de cycle descente (Secondes)",
    "Fuites (Vérin)", "Tension à la batterie"
  ];

  return {
    tablier: isRouge ? tablierRouge : tablierVert,
    rails,
    ressorts,
    cadre: isRouge ? cadreRouge : cadreVert,
    clever: hasCleverSafe ? clever : [],
    verifs: hasCleverSafe ? [] : verifs,
    mesures
  };
};

const ControlePeriodiqueForm = () => {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [productType, setProductType] = useState("");
  const [hasCleverSafe, setHasCleverSafe] = useState(false);
  const [dossierId, setDossierId] = useState(null);
  const sigCanvasRef = useRef(null);

  const [formData, setFormData] = useState({
    prestataire: "", adresse: "", contactPrestataire: "", date: "",
    clientNom: "", clientAdresse: "", clientContact: "",
    vehiculeType: "", vehiculeImmat: "", vehiculeMarque: "", vehiculeIdentifiant: "", porteNumeroSerie: "",
    probleme: "", commentaireProbleme: "",
    controles: { tablier: {}, rails: {}, ressorts: {}, cadre: {}, clever: {}, verifs: {}, mesures: {} },
    signature: ""
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const ref = doc(db, "products-controle-periodique", productId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setProductType(data.name || "");
        setHasCleverSafe((data.categorie || "").toUpperCase() === "SAFE");
      }
    };

    const findDossierId = async () => {
      const snapshot = await getDocs(collection(db, "dossiers"));
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const found = (data.produits || []).find(
          (p) =>
            p.uuid === productId ||
            p.productId === productId ||
            encodeURIComponent((p.name || "").toLowerCase()) === productId
        );
        if (found) {
          setDossierId(docSnap.id);
          return;
        }
      }
    };

    fetchProduct();
    findDossierId();
    setLoading(false);
  }, [productId]);

  const isRouge = !productType.toUpperCase().includes("HUSKY");
  const sections = getSections(isRouge, hasCleverSafe);

  const handleInputChange = (section, key, value) => {
    setFormData((prev) => ({
      ...prev,
      controles: {
        ...prev.controles,
        [section]: {
          ...prev.controles[section],
          [key]: value,
        },
      },
    }));
  };

  const handleGeneratePDF = async () => {
    if (!dossierId) return alert("Aucun dossier CE trouvé.");
    const signatureData = sigCanvasRef.current?.toDataURL() || "";

    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://veryfit-production.up.railway.app"
      : "http://localhost:5000";

    try {
      const response = await axios.post(
        `${baseUrl}/api/dossiers/controle-periodique/generate/${dossierId}/${productId}`,
        { ...formData, signature: signatureData }
      );
      if (response.data?.url) {
        window.open(response.data.url, "_blank");
      } else {
        alert("PDF généré mais aucune URL reçue.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération du PDF.");
    }
  };

  const renderSection = (sectionName, questions) => (
    <div className="border p-4 mb-4">
      <h2 className="font-bold text-lg mb-2">{sectionName}</h2>
      {questions.map((q, index) => (
        <div key={index} className="flex items-center gap-4 mb-2">
          <label className="w-1/2">{q}</label>
          {q.toLowerCase().includes("pression") || q.toLowerCase().includes("temps") || q.toLowerCase().includes("tension") ? (
            <input
              type="text"
              className="border p-2 rounded w-1/2"
              onChange={(e) => handleInputChange(sectionName.toLowerCase(), q, e.target.value)}
            />
          ) : (
            <div className="flex gap-2">
              {["O", "So", "N"].map((val) => (
                <label key={val}>
                  <input
                    type="radio"
                    name={`${sectionName}-${index}`}
                    value={val}
                    onChange={() => handleInputChange(sectionName.toLowerCase(), q, val)}
                  /> {val}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) return <p>Chargement...</p>;
  if (!productType) return <p className="text-red-600 text-center">❌ Produit introuvable.</p>;

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Contrôle Périodique – {productType}</h1>

      <p className="mb-4 italic text-gray-600">
        Légende : <strong>O</strong> = OK &nbsp;&nbsp;
        <strong>So</strong> = Sans objet &nbsp;&nbsp;
        <strong>N</strong> = Non conforme
      </p>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            "prestataire", "adresse", "contactPrestataire", "date",
            "clientNom", "clientAdresse", "clientContact",
            "vehiculeType", "vehiculeImmat", "vehiculeMarque", "vehiculeIdentifiant", "porteNumeroSerie"
          ].map((field, i) => (
            <input
              key={i}
              name={field}
              placeholder={field}
              type={field === "date" ? "date" : "text"}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="border p-2 rounded"
            />
          ))}
        </div>

        {renderSection("1/ Contrôles tablier", sections.tablier)}
        {renderSection("2/ Contrôles rails", sections.rails)}
        {renderSection("3/ Ressorts (sauf VAT)", sections.ressorts)}
        {renderSection("4/ Caisse / cadre arrière", sections.cadre)}
        {hasCleverSafe
          ? renderSection("5/ Système Clever SAFE", sections.clever)
          : renderSection("6/ Vérifications complémentaires", sections.verifs)}
        {renderSection("7/ Relevés, mesures et contrôles", sections.mesures)}

        <div className="mb-6 mt-6">
          <label className="font-semibold block mb-2">Y a-t-il un problème ?</label>
          <select
            className="border p-2 rounded w-full"
            value={formData.probleme}
            onChange={(e) => setFormData({ ...formData, probleme: e.target.value })}
          >
            <option value="">-- Sélectionner --</option>
            <option value="mineur">Problème mineur</option>
            <option value="majeur">Problème majeur</option>
          </select>
          {formData.probleme && (
            <textarea
              className="border p-2 rounded w-full mt-2"
              placeholder="Précisez la nature du problème..."
              value={formData.commentaireProbleme}
              onChange={(e) => setFormData({ ...formData, commentaireProbleme: e.target.value })}
            />
          )}
        </div>

        <div className="mb-6 mt-8">
          <label className="font-semibold block mb-2">Signature du vérificateur :</label>
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="black"
            canvasProps={{ width: 400, height: 150, className: "border rounded shadow bg-white" }}
          />
          <button
            type="button"
            className="text-sm text-blue-600 underline mt-2"
            onClick={() => sigCanvasRef.current?.clear()}
          >
            Effacer la signature
          </button>
        </div>

        <button
          type="button"
          onClick={handleGeneratePDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📄 Générer PDF Contrôle Périodique
        </button>
      </form>
    </div>
  );
};

export default ControlePeriodiqueForm;