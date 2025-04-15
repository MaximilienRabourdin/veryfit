import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SidebarFit";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen border border-blue-500">
      {/* Sidebar */}
      
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-grow p-6 bg-lightGray border border-green-500">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
