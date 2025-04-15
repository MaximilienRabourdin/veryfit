const { db } = require("../config/firebaseAdmin");

class Dossier {
    static async create(data) {
        const dossierRef = db.collection("dossiers").doc();
        data.id = dossierRef.id;
        await dossierRef.set(data);
        return data;
    }

    static async getById(id) {
        const doc = await db.collection("dossiers").doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
}

module.exports = Dossier;
