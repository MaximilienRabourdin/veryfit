import React, { useState } from "react";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const FitCreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    Nom: "",
    Prenom: "",
    Numero: "",
    NumeroAdherent: "",
    CodePostal: "",
    CodeVendeur: "",
    Contact: "",
    Pays: "",
    CodePaysRegion: "",
    Telephone: "",
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
      email,
      password,
      role,
      Nom,
      Prenom,
      Numero,
      NumeroAdherent,
      CodePostal,
      CodeVendeur,
      Contact,
      Pays,
      CodePaysRegion,
      Telephone,
    } = formData;

    if (!email || !password || !role || !Nom || !Prenom) {
      setError("Tous les champs obligatoires doivent être remplis.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (!["Revendeur", "Carrossier", "Utilisateur"].includes(role)) {
      setError("Rôle invalide. Veuillez choisir un rôle valide.");
      setLoading(false);
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        throw new Error("Cet email est déjà utilisé. Veuillez vous connecter.");
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Utilisateur créé :", user.uid);

      await user.getIdToken(true);

      // Enregistrement dans Firestore avec isApproved: true
      await setDoc(doc(db, "users_webapp", user.uid), {
        email,
        role,
        Nom,
        Prenom,
        Numero,
        NumeroAdherent,
        CodePostal,
        CodeVendeur,
        Contact,
        Pays,
        CodePaysRegion,
        Telephone,
        isApproved: true, // ✅ auto-validation
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Données enregistrées dans Firestore");

      // Envoi des claims personnalisés incluant isApproved
      const apiUrl = "http://localhost:5000/api/custom-claims/setCustomClaims";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, role, isApproved: true }), // ✅ auto-validé
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la définition des claims personnalisés.");
      }

      const responseData = await response.json();
      console.log("🔄 Réponse du backend :", responseData);

      setMessage("✅ Compte créé avec succès et activé immédiatement !");
      setFormData({
        email: "",
        password: "",
        role: "",
        Nom: "",
        Prenom: "",
        Numero: "",
        NumeroAdherent: "",
        CodePostal: "",
        CodeVendeur: "",
        Contact: "",
        Pays: "",
        CodePaysRegion: "",
        Telephone: "",
      });
    } catch (err) {
      console.error("❌ Erreur lors de la création du compte :", err.message);
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
          <input name="Nom" placeholder="Nom*" value={formData.Nom} onChange={handleChange} className="border p-2 rounded" required />
          <input name="Prenom" placeholder="Prénom*" value={formData.Prenom} onChange={handleChange} className="border p-2 rounded" required />
          <input name="Numero" placeholder="Numéro" value={formData.Numero} onChange={handleChange} className="border p-2 rounded" />
          <input name="NumeroAdherent" placeholder="Numéro Adhérent" value={formData.NumeroAdherent} onChange={handleChange} className="border p-2 rounded" />
          <input name="CodePostal" placeholder="Code Postal" value={formData.CodePostal} onChange={handleChange} className="border p-2 rounded" />
          <input name="CodeVendeur" placeholder="Code Vendeur" value={formData.CodeVendeur} onChange={handleChange} className="border p-2 rounded" />
          <input name="Contact" placeholder="Contact" value={formData.Contact} onChange={handleChange} className="border p-2 rounded" />
          <input name="Pays" placeholder="Pays" value={formData.Pays} onChange={handleChange} className="border p-2 rounded" />
          <input name="CodePaysRegion" placeholder="Code Pays/Region" value={formData.CodePaysRegion} onChange={handleChange} className="border p-2 rounded" />
          <input name="Telephone" placeholder="Téléphone" value={formData.Telephone} onChange={handleChange} className="border p-2 rounded" />
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
