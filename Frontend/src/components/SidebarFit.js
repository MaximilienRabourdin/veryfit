import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import logo from "../medias/logo_fit.png";
import { FaTimes } from "react-icons/fa";
// Icônes
import tableauBordIcon from "../medias/icon_tableau_bord.png";
import creerCommandeIcon from "../medias/icon_creer_commande.png";
import listeCommandesIcon from "../medias/icon_liste_commandes.png";
import gestionComptesIcon from "../medias/icon_gestion_comptes.png";

const SidebarFit = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-darkBlue text-white w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-64`}
      >
        <div className="flex flex-col justify-between h-full p-6">
          <div>
            {/* Logo + croix */}
            <div className="flex justify-between items-center mb-8">
              <img src={logo} alt="Fit Logo" className="w-1/3" />
              {isOpen && (
                <button onClick={toggleSidebar} className="md:hidden text-white">
                  <FaTimes size={24} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav>
              <ul className="space-y-4">
                <li>
                  <NavLink
                    to="/fit/dashboard"
                    className={({ isActive }) =>
                      isActive ? "text-blue-300 font-bold flex items-center" : "hover:text-gray-300 flex items-center"
                    }
                    onClick={toggleSidebar}
                  >
                    <img src={tableauBordIcon} alt="Tableau" className="mr-3 w-6 h-6" />
                    Tableau de bord
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/fit/create-order"
                    className={({ isActive }) =>
                      isActive ? "text-blue-300 font-bold flex items-center" : "hover:text-gray-300 flex items-center"
                    }
                    onClick={toggleSidebar}
                  >
                    <img src={creerCommandeIcon} alt="Créer" className="mr-3 w-6 h-6" />
                    Créer un dossier CE
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/fit/commandes"
                    className={({ isActive }) =>
                      isActive ? "text-blue-300 font-bold flex items-center" : "hover:text-gray-300 flex items-center"
                    }
                    onClick={toggleSidebar}
                  >
                    <img src={listeCommandesIcon} alt="Liste" className="mr-3 w-6 h-6" />
                    Liste des dossiers
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/fit/manage-accounts"
                    className={({ isActive }) =>
                      isActive ? "text-blue-300 font-bold flex items-center" : "hover:text-gray-300 flex items-center"
                    }
                    onClick={toggleSidebar}
                  >
                    <img src={gestionComptesIcon} alt="Comptes" className="mr-3 w-6 h-6" />
                    Gestion des comptes
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/fit/fit-create-account"
                    className={({ isActive }) =>
                      isActive ? "text-blue-300 font-bold flex items-center" : "hover:text-gray-300 flex items-center"
                    }
                    onClick={toggleSidebar}
                  >
                    <img src={gestionComptesIcon} alt="Créer compte" className="mr-3 w-6 h-6" />
                    Créer un compte
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarFit;
