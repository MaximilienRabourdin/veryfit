const { admin, db } = require("../config/firebaseAdmin");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = admin.storage();
const upload = multer({ storage: multer.memoryStorage() });

const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const file = req.file;
    const bucket = storage.bucket("ton-projet.appspot.com");
    const fileName = `orders/${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      
      return res.status(500).json({ error: "Erreur lors du téléversement." });
    });

    stream.on("finish", async () => {
      await fileUpload.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      res.json({ success: true, fileUrl });
    });

    stream.end(file.buffer);
  } catch (error) {
    
    res.status(500).json({ error: "Erreur lors de l'upload du fichier." });
  }
};

module.exports = { upload, uploadFile };
