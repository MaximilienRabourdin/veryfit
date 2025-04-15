import React from "react";
import { Link } from "react-router-dom";
import logo from "../medias/logo_fit.png";

const SidebarClient = () => {
  return (
    <aside className="bg-darkBlue text-white w-64 p-6 flex flex-col justify-between">
      <div>
        <img src={logo} alt="Fit Doors Logo" className="w-32 mb-8" />
        <nav>
          <ul className="space-y-4">
            <li>
              <Link to="/fit/dashboard" className="hover:text-gray-300">Tableau de bord</Link>
            </li>
            <li>
              <Link to="/fit/create-order" className="hover:text-gray-300">Créer une commande</Link>
            </li>
            <li>
              <Link to="/fit/accounts" className="hover:text-gray-300">Gestion des comptes</Link>
            </li>
          </ul>
        </nav>
      </div>
      <button className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">Se déconnecter</button>
    </aside>
  );
};

export default SidebarClient;
