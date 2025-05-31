import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ajustez le chemin selon votre structure
import logo from "../medias/logo_fit.png";

const SidebarClient = () => {
  const navigate = useNavigate();

  // 🔹 MODIFIÉ : Fonction de déconnexion avec redirection vers /
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('✅ Utilisateur déconnecté');
      navigate('/'); // 🔹 Redirection vers la page d'accueil
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      alert('Erreur lors de la déconnexion');
    }
  };

  return (
    <aside className="bg-darkBlue text-white w-64 p-6 flex flex-col justify-between">
      <div>
        <img src={logo} alt="Fit Doors Logo" className="w-32 mb-8" />
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/client/dashboard" className="hover:text-gray-300 flex items-center gap-2">
                <span>🏠</span>
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link to="/client/equipements" className="hover:text-gray-300 flex items-center gap-2">
                <span>🚚</span>
                Mes équipements
              </Link>
            </li>
            <li>
              <Link to="/client/rapports" className="hover:text-gray-300 flex items-center gap-2">
                <span>📄</span>
                Mes rapports
              </Link>
            </li>
            <li>
              <a 
                href="https://drive.google.com/drive/u/0/folders/1SkwJS3TckM34AMIVnZ5QW8zV-R6oN5yK" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-300 flex items-center gap-2"
              >
                <span>📖</span>
                Notices d'utilisation
              </a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* 🔹 MODIFIÉ : Bouton avec fonction de déconnexion */}
      <button 
        onClick={handleLogout}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        Se déconnecter
      </button>
    </aside>
  );
};

export default SidebarClient;