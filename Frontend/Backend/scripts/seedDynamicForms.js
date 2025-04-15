const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-service-key.json");

// Initialiser Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Données des formulaires dynamiques
const formsData = {
  "FIT Clever SAFE Bois": {
    steps: [
      {
        title: "Contrôles tablier",
        fields: [
          { label: "Calage des roulettes", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes FIT+ (Rouge)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Bras haut roulettes FIT X-Trem (Bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Ressorts de calage pour roulettes Fit X-trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Supports de roulettes renforcées", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage des vis des écrous", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Axes des charnières", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Joints latéraux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition apprêtée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition millenium (CP Blanc)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition peinture", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque de firme avec QR-Code instruction (face extérieure de la porte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Sticker sécurité section basse", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque CE sur section haute côté intérieur", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Contrôles rails",
        fields: [
          { label: "Jonction rails horizontaux/verticaux (continue)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation rails verticaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Fixation rails horizontaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Côte entre le rail horizontal chauffeur et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Côte entre le rail horizontal passager et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Parallélisme rails verticaux/horizontaux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Jeu constant porte/rails", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Ressorts",
        fields: [
          { label: "Attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles arbre ressort", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage pièces d'immobilisation", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage support central", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position des câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Tension (Nombre de tours)", type: "number", unit: "tours", required: true },
        ],
      },
      {
        title: "Caisse / Cadre arrière",
        fields: [
          { label: "Equerrage cadre arrière", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parallélisme", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parodies latérales", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Type de pavillon", type: "select", options: ["Translucide", "Isolé"], required: true },
        ],
      },
      {
        title: "Système Clever SAFE",
        fields: [
          { label: "Plaque CE intérieur coffret", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation du vérin", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure montée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure descente", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande Safe On/Off", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position du vérin par rapport au cadre", type: "text", required: true },
          { label: "Serrage barre de liaison et contre écrou", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Relevés et mesures",
        fields: [
          { label: "Pression coffret de commande", type: "number", unit: "bars", required: true },
          { label: "Temps de cycle montée", type: "number", unit: "secondes", required: true },
          { label: "Temps de cycle descente", type: "number", unit: "secondes", required: true },
          { label: "Fuites (après pulvérisation détecteur de fuites)", type: "text", required: true },
          { label: "Tension à la batterie", type: "number", unit: "volts", required: true },
        ],
      },
    ],
  },
  "FIT Clever SAFE CC": {
    steps: [
      {
        title: "Contrôles tablier",
        fields: [
          { label: "Calage des roulettes", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes FIT+ (Rouge)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Bras haut roulettes FIT X-Trem (Bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Ressorts de calage pour roulettes Fit X-trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Supports de roulettes renforcées", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage des vis des écrous", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Axes des charnières", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Joints latéraux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition apprêtée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition millenium (CP Blanc)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition peinture", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque de firme avec QR-Code instruction (face extérieure de la porte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Sticker sécurité section basse", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque CE sur section haute côté intérieur", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Contrôles rails",
        fields: [
          { label: "Jonction rails horizontaux/verticaux (continue)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation rails verticaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Fixation rails horizontaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Côte entre le rail horizontal chauffeur et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Côte entre le rail horizontal passager et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Parallélisme rails verticaux/horizontaux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Jeu constant porte/rails", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Ressorts",
        fields: [
          { label: "Attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles arbre ressort", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage pièces d'immobilisation", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage support central", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position des câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Tension (Nombre de tours)", type: "number", unit: "tours", required: true },
        ],
      },
      {
        title: "Caisse / Cadre arrière",
        fields: [
          { label: "Equerrage cadre arrière", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parallélisme", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parodies latérales", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Type de pavillon", type: "select", options: ["Translucide", "Isolé"], required: true },
        ],
      },
      {
        title: "Système Clever SAFE",
        fields: [
          { label: "Plaque CE intérieur coffret", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation du vérin", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure montée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure descente", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande Safe On/Off", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position du vérin par rapport au cadre", type: "text", required: true },
          { label: "Serrage barre de liaison et contre écrou", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Relevés et mesures",
        fields: [
          { label: "Pression coffret de commande", type: "number", unit: "bars", required: true },
          { label: "Temps de cycle montée", type: "number", unit: "secondes", required: true },
          { label: "Temps de cycle descente", type: "number", unit: "secondes", required: true },
          { label: "Fuites (après pulvérisation détecteur de fuites)", type: "text", required: true },
          { label: "Tension à la batterie", type: "number", unit: "volts", required: true },
        ],
      },
    ],
  },
  "FIT Clever SAFE Forty": {
    steps: [
      {
        title: "Contrôles tablier",
        fields: [
          { label: "Calage des roulettes", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes FIT+ (Rouge)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Bras haut roulettes FIT X-Trem (Bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Ressorts de calage pour roulettes Fit X-trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Supports de roulettes renforcées", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage des vis des écrous", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Axes des charnières", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Joints latéraux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition apprêtée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition millenium (CP Blanc)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition peinture", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque de firme avec QR-Code instruction (face extérieure de la porte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Sticker sécurité section basse", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque CE sur section haute côté intérieur", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Contrôles rails",
        fields: [
          { label: "Jonction rails horizontaux/verticaux (continue)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation rails verticaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Fixation rails horizontaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Côte entre le rail horizontal chauffeur et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Côte entre le rail horizontal passager et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Parallélisme rails verticaux/horizontaux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Jeu constant porte/rails", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Ressorts",
        fields: [
          { label: "Attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles arbre ressort", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage pièces d'immobilisation", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage support central", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position des câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Tension (Nombre de tours)", type: "number", unit: "tours", required: true },
        ],
      },
      {
        title: "Caisse / Cadre arrière",
        fields: [
          { label: "Equerrage cadre arrière", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parallélisme", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parodies latérales", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Type de pavillon", type: "select", options: ["Translucide", "Isolé"], required: true },
        ],
      },
      {
        title: "Système Clever SAFE",
        fields: [
          { label: "Plaque CE intérieur coffret", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation du vérin", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure montée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure descente", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande Safe On/Off", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position du vérin par rapport au cadre", type: "text", required: true },
          { label: "Serrage barre de liaison et contre écrou", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Relevés et mesures",
        fields: [
          { label: "Pression coffret de commande", type: "number", unit: "bars", required: true },
          { label: "Temps de cycle montée", type: "number", unit: "secondes", required: true },
          { label: "Temps de cycle descente", type: "number", unit: "secondes", required: true },
          { label: "Fuites (après pulvérisation détecteur de fuites)", type: "text", required: true },
          { label: "Tension à la batterie", type: "number", unit: "volts", required: true },
        ],
      },
    ],
  },
  "FIT Clever SAFE RR": {
    steps: [
      {
        title: "Contrôles tablier",
        fields: [
          { label: "Calage des roulettes", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes FIT+ (Rouge)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Bras haut roulettes FIT X-Trem (Bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Ressorts de calage pour roulettes Fit X-trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Supports de roulettes renforcées", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage des vis des écrous", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Axes des charnières", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Joints latéraux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition apprêtée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition millenium (CP Blanc)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition peinture", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque de firme avec QR-Code instruction (face extérieure de la porte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Sticker sécurité section basse", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque CE sur section haute côté intérieur", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Contrôles rails",
        fields: [
          { label: "Jonction rails horizontaux/verticaux (continue)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation rails verticaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Fixation rails horizontaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Côte entre le rail horizontal chauffeur et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Côte entre le rail horizontal passager et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Parallélisme rails verticaux/horizontaux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Jeu constant porte/rails", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Ressorts",
        fields: [
          { label: "Attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles arbre ressort", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage pièces d'immobilisation", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage support central", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position des câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Tension (Nombre de tours)", type: "number", unit: "tours", required: true },
        ],
      },
      {
        title: "Caisse / Cadre arrière",
        fields: [
          { label: "Equerrage cadre arrière", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parallélisme", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parodies latérales", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Type de pavillon", type: "select", options: ["Translucide", "Isolé"], required: true },
        ],
      },
      {
        title: "Système Clever SAFE",
        fields: [
          { label: "Plaque CE intérieur coffret", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation du vérin", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure montée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure descente", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande Safe On/Off", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position du vérin par rapport au cadre", type: "text", required: true },
          { label: "Serrage barre de liaison et contre écrou", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Relevés et mesures",
        fields: [
          { label: "Pression coffret de commande", type: "number", unit: "bars", required: true },
          { label: "Temps de cycle montée", type: "number", unit: "secondes", required: true },
          { label: "Temps de cycle descente", type: "number", unit: "secondes", required: true },
          { label: "Fuites (après pulvérisation détecteur de fuites)", type: "text", required: true },
          { label: "Tension à la batterie", type: "number", unit: "volts", required: true },
        ],
      },
    ],
  },
  "FIT Clever SAFE Husky": {
    steps: [
      {
        title: "Contrôles tablier",
        fields: [
          { label: "Calage des roulettes", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes FIT Max (Verte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Bras haut roulettes FIT X-Trem (Bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Roulettes Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Ressort de calage pour roulette Fit X-Trem (bleu)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Réglage des excentriques", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage des vis des écrous", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Axes des charnières", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Joints latéraux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition brute", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Finition peinture", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque de firme avec QR-Code instruction (face extérieure de la porte)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Sticker sécurité section basse", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Plaque CE sur section haute côté intérieur", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Contrôles rails",
        fields: [
          { label: "Jonction rails horizontaux/verticaux (continue)", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation rails verticaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Fixation rails horizontaux", type: "radio", options: ["Rivetage", "Collage", "Vissage"], required: true },
          { label: "Côte entre le rail horizontal chauffeur et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Côte entre le rail horizontal passager et le pavillon (en mm)", type: "number", unit: "mm", required: true },
          { label: "Parallélisme rails verticaux/horizontaux", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Jeu constant porte/rails", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Ressorts",
        fields: [
          { label: "Attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles attaches câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Goupilles arbre ressort", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage pièces d'immobilisation", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Serrage support central", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position des câbles", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Tension (Nombre de tours)", type: "number", unit: "tours", required: true },
        ],
      },
      {
        title: "Caisse / Cadre arrière",
        fields: [
          { label: "Equerrage cadre arrière", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parallélisme", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Parodies latérales", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Type de pavillon", type: "select", options: ["Translucide", "Isolé"], required: true },
        ],
      },
      {
        title: "Système Clever SAFE",
        fields: [
          { label: "Plaque CE intérieur coffret", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Fixation du vérin", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure montée", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande extérieure descente", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Test commande Safe On/Off", type: "radio", options: ["O", "So", "N"], required: true },
          { label: "Position du vérin par rapport au cadre", type: "text", required: true },
          { label: "Serrage barre de liaison et contre écrou", type: "radio", options: ["O", "So", "N"], required: true },
        ],
      },
      {
        title: "Relevés et mesures",
        fields: [
          { label: "Pression coffret de commande", type: "number", unit: "bars", required: true },
          { label: "Temps de cycle montée", type: "number", unit: "secondes", required: true },
          { label: "Temps de cycle descente", type: "number", unit: "secondes", required: true },
          { label: "Fuites (après pulvérisation détecteur de fuites)", type: "text", required: true },
          { label: "Tension à la batterie", type: "number", unit: "volts", required: true },
        ],
      },

],
},
};

// Fonction pour injecter les données dans Firestore
const seedFirestore = async () => {
  try {
    for (const [formName, formData] of Object.entries(formsData)) {
      const ref = db.collection("dynamicForms").doc(formName);
      await ref.set(formData);
      
    }
    
  } catch (error) {
    
  }
};

// Exécuter le script
seedFirestore();