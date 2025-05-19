import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const FitCreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "", password: "", role: "", Nom: "", Prenom: "",
    Numero: "", NumeroAdherent: "", CodePostal: "", CodeVendeur: "",
    Contact: "", Pays: "", CodePaysRegion: "", Telephone: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); setError("");

    try {
      const { email, password, role, Nom, Prenom, ...rest } = formData;

      const existing = await fetchSignInMethodsForEmail(auth, email);
      if (existing.length > 0) throw new Error("Email déjà utilisé.");

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Utilisateur créé :", user.uid);

      await setDoc(doc(db, "users_webapp", user.uid), {
        email, role, Nom, Prenom, ...rest,
        isApproved: true,
        createdAt: new Date().toISOString(),
      });

      const token = await user.getIdToken();

      const response = await fetch("https://veryfit-backend.onrender.com/api/custom-claims/setCustomClaims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: user.uid, role: role.toLowerCase(), isApproved: true }),
      });

      if (!response.ok) throw new Error("Échec claims backend.");

      // 🔁 Récupération claims avec retry
      let ok = false;
      for (let i = 0; i < 5; i++) {
        const result = await user.getIdTokenResult(true);
        console.log(`🔁 Retry ${i + 1}/5 - claims :`, result.claims);
        if (result.claims?.role) {
          ok = true;
          break;
        }
        await new Promise(res => setTimeout(res, 1000));
      }

      if (!ok) throw new Error("❌ Impossible de récupérer les claims Firebase.");

      setMessage("✅ Compte créé avec succès !");
      setFormData({
        email: "", password: "", role: "", Nom: "", Prenom: "",
        Numero: "", NumeroAdherent: "", CodePostal: "", CodeVendeur: "",
        Contact: "", Pays: "", CodePaysRegion: "", Telephone: "",
      });
    } catch (err) {
      console.error("❌ Erreur création compte :", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md max-w-2xl w-full space-y-4">
        <h1 className="text-2xl font-bold text-blue-800 text-center">Créer un compte</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="email" required placeholder="Email*" value={formData.email} onChange={handleChange} className="border p-2 rounded" />
          <input name="password" type="password" required placeholder="Mot de passe*" value={formData.password} onChange={handleChange} className="border p-2 rounded" />
          <select name="role" required value={formData.role} onChange={handleChange} className="border p-2 rounded">
            <option value="">Choisir un rôle</option>
            <option value="Revendeur">Revendeur</option>
            <option value="Carrossier">Carrossier</option>
            <option value="Utilisateur">Utilisateur</option>
          </select>
          {["Nom", "Prenom", "Numero", "NumeroAdherent", "CodePostal", "CodeVendeur", "Contact", "Pays", "CodePaysRegion", "Telephone"].map((field) => (
            <input key={field} name={field} placeholder={field} value={formData[field]} onChange={handleChange} className="border p-2 rounded" />
          ))}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {loading ? "Création en cours..." : "Créer"}
        </button>
        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default FitCreateAccount;
