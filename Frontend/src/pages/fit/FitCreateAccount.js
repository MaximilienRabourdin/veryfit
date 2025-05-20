import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  signInWithEmailAndPassword,
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

      console.log("📤 Envoi des claims à l'API...");
      try {
        const response = await fetch("https://veryfit-backend.onrender.com/api/custom-claims/setCustomClaims", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
            "X-Requested-With": "XMLHttpRequest"
          },
          mode: "cors",
          body: JSON.stringify({ 
            uid: user.uid, 
            role: role.toLowerCase(), 
            isApproved: true 
          }),
        });
        
        if (!response.ok) {
          console.error("❌ Erreur API:", response.status, response.statusText);
          const errorData = await response.text();
          console.error("Détails:", errorData);
          throw new Error(`Erreur lors de la définition des claims (${response.status})`);
        } else {
          console.log("✅ API success:", response.status);
          const data = await response.json();
          console.log("📤 Réponse API:", data);
        }
      } catch (err) {
        console.error("❌ Erreur fetch:", err);
        // Continuer malgré l'erreur - on ne veut pas que l'utilisateur soit bloqué
        // même si les claims ne sont pas définis
      }

      // ✅ Patch : on force le logout/login pour recharger les claims immédiatement
      await signOut(auth);
      await new Promise((res) => setTimeout(res, 500));
      const reauth = await signInWithEmailAndPassword(auth, email, password);
      console.log("🔁 Reconnecté pour recharger les claims :", reauth.user.uid);

      // 🔁 Retry pour récupérer les claims
      let claimsOk = false;
      for (let i = 0; i < 5; i++) {
        const refreshed = await reauth.user.getIdTokenResult(true);
        if (refreshed.claims?.role) {
          console.log(`✅ Claims récupérés au retry ${i + 1} :`, refreshed.claims);
          claimsOk = true;
          break;
        }
        console.log(`🔁 Retry ${i + 1}/5 - claims :`, refreshed.claims);
        await new Promise(res => setTimeout(res, 1000));
      }

      if (!claimsOk) {
        console.warn("⚠️ Impossible de récupérer les claims Firebase, mais l'utilisateur a été créé.");
        setMessage("✅ Compte créé avec succès ! La synchronisation des permissions peut prendre quelques minutes.");
      } else {
        setMessage("✅ Compte créé avec succès !");
      }
      
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