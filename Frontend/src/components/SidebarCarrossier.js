import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import logo from "../medias/logo_fit.png";
import { FaTimes } from "react-icons/fa";

const SidebarRevendeur = ({ isOpen, toggleSidebar }) => {
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
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
          aria-label="Fermer le menu"
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-darkBlue text-white w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-64`}
      >
        <div className="flex flex-col justify-between h-full p-6">
          <div>
            {/* Logo */}
            <div className="flex justify-between items-center mb-8">
              <img src={logo} alt="Fit Doors Logo" className="w-1/3" />
              {isOpen && (
                <button
                  onClick={toggleSidebar}
                  className="md:hidden text-white focus:outline-none"
                  aria-label="Fermer le menu"
                >
                  <FaTimes size={24} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav>
              <ul className="space-y-4">
                {[
                  { to: "/carrossier/dashboard", label: "Tableau de bord" },
                  { to: "/carrossier/orders", label: "Commandes" },
                  { to: "/carrossier/declaration-montage", label: "Déclaration de montage" },
                  { to: "/carrossier/controle-periodique", label: "Controle périodique" },
                ].map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        isActive
                          ? "text-blue-300 font-bold"
                          : "hover:text-gray-300"
                      }
                      onClick={toggleSidebar}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white w-full py-2 px-4 rounded hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarRevendeur;
