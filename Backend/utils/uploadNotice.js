// 📁 Backend/utils/uploadNotice.js

const { uploadToDrive } = require("./googleDrive");

/**
 * Upload un fichier PDF en mémoire vers Google Drive
 * @param {object} file - L'objet fichier reçu via multer (avec .buffer et .originalname)
 * @returns {string} - L'URL publique Google Drive du fichier
 */
const uploadNotice = async (file) => {
  const fileUrl = await uploadToDrive(file.buffer, file.originalname);
  return fileUrl;
};

module.exports = { uploadNotice };
