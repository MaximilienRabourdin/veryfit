import { replace } from 'replace-in-file'; // Utilisation de l'export nommé 'replace'

const options = {
  files: 'Frontend/src/**/*.{js,jsx,ts,tsx}', // Dossier à scanner
  from: /http:\/\/localhost:5000/g, // Expression régulière à remplacer
  to: 'http://veryfit-production.up.railway.app', // Remplacer par l'URL backend déployé
};

replace(options)
  .then((results) => {
    console.log('Modifications effectuées dans les fichiers :', results);
  })
  .catch((error) => {
    console.error('Erreur lors de la modification des fichiers :', error);
  });
