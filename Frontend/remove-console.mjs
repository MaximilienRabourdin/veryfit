import { replaceInFile } from 'replace-in-file';

const options = {
  files: [
    'Frontend/src/**/*.js',
    'Backend/**/*.js',
  ],
  from: [
    /console\.log\([^)]*\);?/g,
    /console\.warn\([^)]*\);?/g,
    /console\.error\([^)]*\);?/g,
    /console\.debug\([^)]*\);?/g
  ],
  to: '',
};

try {
  const results = await replaceInFile(options);
  console.log("✅ Suppression terminée dans les fichiers suivants :");
  results.forEach(r => console.log("🧹", r.file));
} catch (err) {
  console.error('❌ Erreur :', err);
}
