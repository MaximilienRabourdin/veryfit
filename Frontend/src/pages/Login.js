// pages/Login.js
import React, { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import logo from "../medias/logo_fit.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [connectedUser, setConnectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setConnectedUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setConnectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await user.getIdToken(true);
      const token = await user.getIdTokenResult();
      const { role, isApproved } = token.claims;

      if (!isApproved) {
        setError("Votre compte est en attente de validation.");
        return;
      }

      const userId = token.claims.user_id || user.uid;
      localStorage.setItem("userId", userId);
      localStorage.setItem("idToken", token.token);

      switch (role.toLowerCase()) {
        case "super admin":
          navigate("/fit/dashboard");
          break;
        case "revendeur":
          navigate("/revendeur/dashboard");
          break;
        case "carrossier":
          navigate("/carrossier/dashboard");
          break;
        case "utilisateur":
          navigate("/client/dashboard");
          break;
        default:
          setError("Rôle utilisateur inconnu.");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion :", err);
      setError("Email ou mot de passe incorrect.");
    }
  };

  return (
    <div className="flex sm:flex-col md:flex-row min-h-screen">
      <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logo} alt="Logo FIT" className="mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-bold text-customBlue">
              CONNEXION À LA PLATEFORME
            </h2>
            <p className="text-gray-500 text-center mb-4">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>

          {/* ✅ Si connecté, on propose Accès ou Changement */}
          {connectedUser && (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6">
              <p>
                Vous êtes déjà connecté. Vous pouvez accéder à votre espace ou changer de compte.
              </p>
              <div className="flex gap-4 mt-3">
                <button
                  onClick={() => {
                    connectedUser.getIdTokenResult().then((token) => {
                      const role = token.claims.role?.toLowerCase();
                      const paths = {
                        "super admin": "/fit/dashboard",
                        revendeur: "/revendeur/dashboard",
                        carrossier: "/carrossier/dashboard",
                        utilisateur: "/client/dashboard",
                      };
                      const path = paths[role];
                      if (path) navigate(path);
                    });
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Accéder à mon espace
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Changer de compte
                </button>
              </div>
            </div>
          )}

          {/* Formulaire de login */}
          {!connectedUser && (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
              <button
                type="submit"
                className="w-full font-bold bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition"
              >
                Se connecter
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 bg-login bg-cover bg-center relative">
        <div className="z-10 text-white p-16 flex justify-start flex-col items-start">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-wide">
            BIENVENUE SUR LA PLATEFORME <br /> DE GESTION FIT DOORS
          </h2>
          <div className="mt-8 w-[8rem] md:w-[10rem] h-[8px] md:h-[10px] bg-red-600"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
