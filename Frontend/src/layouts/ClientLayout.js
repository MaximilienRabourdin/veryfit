import React from "react";
import { Outlet } from "react-router-dom";
import SidebarClient from "../components/SidebarClient";

const ClientLayout = () => {
  return (
    <div className="flex min-h-screen">
      <SidebarClient />
      <main className="flex-grow p-6 bg-lightGray">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
