import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logo from "../medias/logo_fit.png";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    company: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { email, password, role, company } = formData;

    // Validation des champs
    if (!email || !password || !role) {
      setError("Tous les champs obligatoires doivent être remplis.");
      return;
    }

    // Vérification de la longueur du mot de passe
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      console.log("Étape 1 : Début de la création du compte");

      // Étape 1 : Créer l'utilisateur dans Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Étape 2 : Utilisateur créé dans Firebase Auth", user);

      // Étape 2 : Ajouter les informations utilisateur dans Firestore
      const userData = {
        email,
        role,
        company,
        isApproved: false, // Compte à valider manuellement
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userData);
      console.log(
        "Étape 3 : Données utilisateur ajoutées à Firestore",
        userData
      );

      // Étape 3 : Définir les revendications utilisateur via le backend
      const response = await fetch(
        "http://veryfit-production.up.railway.app/api/auth/set-claims",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: user.uid,
            role: role,
          }),
        }
      );

      const result = await response.json();
      console.log(
        "Étape 4 : Réponse du backend pour les revendications",
        result
      );

      if (response.ok) {
        setMessage(
          "Votre compte a été créé avec succès ! Il est en attente de validation par un administrateur."
        );
        console.log("Étape 5 : Compte créé avec succès");
        setTimeout(() => navigate("/"), 3000); // Redirection vers la page de connexion après 3 secondes
      } else {
        console.error(
          "Erreur lors de la définition des revendications :",
          result.message
        );
        setError(
          "Erreur lors de la définition des revendications. Veuillez réessayer."
        );
      }
    } catch (err) {
      console.error("Erreur lors de la création du compte :", err);

      if (err.code === "auth/email-already-in-use") {
        setError("Cet email est déjà utilisé.");
      } else if (err.code === "auth/weak-password") {
        setError("Le mot de passe est trop faible. Minimum 6 caractères.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="flex sm:flex-col md:flex-row min-h-screen">
      {/* Section gauche : Formulaire */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src={logo} alt="Logo FIT" className="mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-customBlue">
              CRÉATION DE COMPTE
            </h2>
            <p className="text-gray-500 text-center mb-4">
              Veuillez remplir le formulaire pour demander un accès
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adresse email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Mot de passe*
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Rôle*
              </label>
              <div className="mb-4">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="Revendeur">Revendeur</option>
                  <option value="Carrossier">Carrossier</option>
                  <option value="Utilisateur">Utilisateur</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label
                htmlFor="company"
                className="block text-sm font-medium mb-2"
              >
                Raison sociale
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
              />
            </div>
            <button
              type="submit"
              className="w-full font-bold bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Créer un compte
            </button>
          </form>
          {message && (
            <p className="mt-4 text-green-500 text-center">{message}</p>
          )}
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </div>
      </div>

      {/* Section droite : Visuel */}
      <div className="hidden md:flex w-full md:w-1/2 bg-login bg-cover bg-center relative">
        <div className="z-10 text-white p-16 flex justify-start flex-col items-start animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-wide animate-text-glow">
            PLATEFORME DE GESTION <br /> DES COMMANDES
          </h2>
          <div className="mt-8 w-[8rem] md:w-[10rem] h-[8px] md:h-[10px] bg-red-600 animate-grow"></div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
