// Script Node.js pour encoder votre service account
// Sauvegardez ce script dans un fichier encode-key.js
// Utilisez: node encode-key.js path/to/your/service-account.json

const fs = require('fs');

if (process.argv.length < 3) {
  console.log('Usage: node encode-key.js path/to/service-account.json');
  process.exit(1);
}

const filePath = process.argv[2];

try {
  // Lire le fichier JSON
  const serviceAccount = fs.readFileSync(filePath, 'utf8');
  
  // Vérifier que c'est un JSON valide
  JSON.parse(serviceAccount);
  
  // Encoder en Base64
  const base64 = Buffer.from(serviceAccount).toString('base64');
  
  console.log('✅ Service account encodé avec succès !');
  console.log('');
  console.log('Copiez cette valeur dans votre .env :');
  console.log('');
  console.log(`FIREBASE_SERVICE_ACCOUNT_BASE64=${base64}`);
  console.log('');
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}