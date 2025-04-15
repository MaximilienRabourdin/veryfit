import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarFit from "../components/SidebarFit";
import { FaBars } from "react-icons/fa";
import logo from "../medias/logo_fit.png";

const FitLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarFit isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-100 relative">
        {/* Burger menu mobile */}
        <div className="md:hidden bg-darkBlue p-4 text-white flex justify-between items-center fixed top-0 left-0 w-full z-40">
          <img src={logo} alt="Fit Logo" className="h-8" />
          <button onClick={toggleSidebar}>
            <FaBars size={24} />
          </button>
        </div>

        {/* Décalage du contenu pour mobile */}
        <div className="pt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FitLayout;
