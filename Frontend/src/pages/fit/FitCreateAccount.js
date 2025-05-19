// pages/fit/FitCreateAccount.js

import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const FitCreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "", password: "", role: "",
    Nom: "", Prenom: "", Numero: "", NumeroAdherent: "",
    CodePostal: "", CodeVendeur: "", Contact: "",
    Pays: "", CodePaysRegion: "", Telephone: "",
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
    setError("");
    setMessage("");
    setLoading(true);

    const {
      email, password, role, Nom, Prenom,
      Numero, NumeroAdherent, CodePostal,
      CodeVendeur, Contact, Pays,
      CodePaysRegion, Telephone,
    } = formData;

    try {
      const existing = await fetchSignInMethodsForEmail(auth, email);
      if (existing.length > 0) throw new Error("Email déjà utilisé.");

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Utilisateur créé :", user.uid);

      await setDoc(doc(db, "users_webapp", user.uid), {
        email, role, Nom, Prenom, Numero, NumeroAdherent,
        CodePostal, CodeVendeur, Contact, Pays, CodePaysRegion, Telephone,
        isApproved: true, createdAt: new Date().toISOString(),
      });

      const idToken = await user.getIdToken();

      await fetch("https://veryfit-backend.onrender.com/api/custom-claims/setCustomClaims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid: user.uid, role: role.toLowerCase(), isApproved: true }),
      });

      // 🔁 Retry pour récupérer les claims
      let retries = 0;
      let claimsOk = false;
      while (retries < 5) {
        const refreshed = await user.getIdTokenResult(true);
        if (refreshed.claims?.role) {
          claimsOk = true;
          break;
        }
        console.log(`🔁 Retry ${retries + 1}/5 - claims :`, refreshed.claims);
        await new Promise(res => setTimeout(res, 1000));
        retries++;
      }

      if (!claimsOk) throw new Error("❌ Impossible de récupérer les claims Firebase. Veuillez réessayer.");

      setMessage("✅ Compte créé avec succès !");
      setFormData({
        email: "", password: "", role: "", Nom: "", Prenom: "",
        Numero: "", NumeroAdherent: "", CodePostal: "",
        CodeVendeur: "", Contact: "", Pays: "", CodePaysRegion: "", Telephone: "",
      });

    } catch (err) {
      console.error("❌ Erreur :", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold uppercase my-6 text-blue-950 text-center">Créer un compte</h1>
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-full max-w-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="email" type="email" placeholder="Email*" value={formData.email} onChange={handleChange} className="border p-2 rounded" required />
          <input name="password" type="password" placeholder="Mot de passe*" value={formData.password} onChange={handleChange} className="border p-2 rounded" required />
          <select name="role" value={formData.role} onChange={handleChange} className="border p-2 rounded" required>
            <option value="">Choisir un rôle</option>
            <option value="Revendeur">Revendeur</option>
            <option value="Carrossier">Carrossier</option>
            <option value="Utilisateur">Utilisateur</option>
          </select>
          {["Nom", "Prenom", "Numero", "NumeroAdherent", "CodePostal", "CodeVendeur", "Contact", "Pays", "CodePaysRegion", "Telephone"].map((field) => (
            <input key={field} name={field} placeholder={field} value={formData[field]} onChange={handleChange} className="border p-2 rounded" />
          ))}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mt-6 hover:bg-blue-700" disabled={loading}>
          {loading ? "Création en cours..." : "Créer"}
        </button>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default FitCreateAccount;
