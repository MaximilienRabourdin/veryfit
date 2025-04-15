const stream = require("stream");
const { google } = require("googleapis"); // ✅ une seule fois ici
const auth = require("../config/googleDriveAuth");
require("dotenv").config();

let drive;
(async () => {
  const authClient = await auth.getClient(); // 🔐 bon client OAuth2
  drive = google.drive({ version: "v3", auth: authClient });
})();

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const uploadToDrive = async (buffer, originalname) => {
  try {
    if (!drive) throw new Error("Google Drive non initialisé");

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const fileMetadata = {
      name: originalname,
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

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
    
    return fileUrl;
  } catch (error) {
    
    throw new Error("Erreur upload Google Drive");
  }
};

module.exports = { uploadToDrive };
