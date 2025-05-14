const stream = require("stream");
require("dotenv").config();

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const uploadToDrive = async (buffer, originalname) => {
  try {
    if (!drive) throw new Error("Google Drive client non initialisé");

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

    const url = `https://drive.google.com/uc?id=${fileId}`;
    
    return url;
  } catch (error) {
    
    throw new Error("Erreur upload Google Drive");
  }
};

module.exports = { uploadToDrive };
