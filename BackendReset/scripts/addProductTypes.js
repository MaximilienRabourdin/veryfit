const { db } = require("../config/firebaseAdmin");

async function addProductTypes() {
  const typesDePorte = [
    "FIT Clever Bois",
    "FIT VAT Clever Husky",
    "FIT VAT Clever Safe Husky",
    "FIT VAT Forty",
    "FIT VAT Husky",
    "FIT VAT RR",
    "FIT Clever CC",
    "FIT Clever Forty",
    "FIT Clever RR",
    "FIT Clever Safe Bois",
    "FIT Clever Safe CC",
    "FIT Clever Safe Forty",
    "FIT Clever Safe RR",
    "FIT VAT CC"
  ];

  const templates = ["Carrossier", "Revendeur", "Controleur"];

  for (const template of templates) {
    await db.collection("formTemplates").doc(template).update({
      typesDePorte,
    });
    
  }
}

addProductTypes();
