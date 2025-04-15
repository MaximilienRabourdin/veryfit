import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarCarrossier from "../components/SidebarCarrossier";

const CarrossierLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fixe */}
      <SidebarCarrossier 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Contenu principal défilable */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-100">
        {/* Bouton burger pour mobile */}
        <div className="md:hidden bg-darkBlue p-4">
          <button
            className="text-white focus:outline-none"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </div>

        {/* Contenu avec padding */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CarrossierLayout;
