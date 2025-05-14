const { google } = require("googleapis");
const { auth } = require("../config/firebaseAdmin"); // exporté depuis firebaseAdmin.js
const stream = require("stream");

const drive = google.drive({ version: "v3", auth });
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // ✅ depuis .env

// ✅ Upload à partir d’un buffer (sans fichier sur le disque)
const uploadToDrive = async (buffer, fileName) => {
  try {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const fileMetadata = {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: "application/pdf",
      body: bufferStream,
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id",
    });

    const fileId = file.data.id;

    // ✅ Rendre le fichier accessible publiquement
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileUrl = `https://drive.google.com/file/d/${fileId}`;
    
    return fileUrl;
  } catch (error) {
    
    throw new Error("Erreur upload Google Drive");
  }
};

module.exports = { uploadToDrive };
