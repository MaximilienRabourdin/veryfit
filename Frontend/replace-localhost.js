const replace = require('replace-in-file'); // Utilisation de CommonJS avec `require`

const options = {
  files: ['./src/**/*.js', './src/**/*.jsx'],  // Liste des fichiers à modifier
  from: /http:\/\/localhost:5000/g,  // Recherche de "http://localhost:5000"
  to: 'https://veryfit-production.up.railway.app',  // Remplace par l'URL de production
};

try {
  const results = replace(options);  // Appel de la fonction replace
  console.log('Modifications effectuées : ', results);
} catch (error) {
  console.error('Erreur lors de la modification des fichiers: ', error);
}
