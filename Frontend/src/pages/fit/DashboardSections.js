import React from "react";
import { useNavigate } from "react-router-dom";

// Import des icônes
import DeclarerIcon from "../../medias/déclaration_a_déclarer.svg";
import AvaliderIcon from "../../medias/declaration_a_valider.svg";
import RefuseIcon from "../../medias/déclaration_validée.svg";

const DashboardSections = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Section Déclarations à valider */}
      <div
        className="bg-white shadow-md p-4 rounded flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate("/fit/commandes?filter=avalider")}
      >
        <img src={AvaliderIcon} alt="À valider" className="w-12 h-12" />
        <div>
          <h2 className="text-lg font-semibold">Déclarations reçus</h2>
          <p className="text-2xl font-bold text-orange-500">{stats.toValidate}</p>
        </div>
      </div>


      {/* Section Commandes à déclarer */}
      <div
        className="bg-white shadow-md p-4 rounded flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate("/fit/commandes?filter=adeclarer")}
      >
        <img src={DeclarerIcon} alt="À déclarer" className="w-12 h-12" />
        <div>
          <h2 className="text-lg font-semibold">Commandes à déclarer</h2>
          <p className="text-2xl font-bold text-blue-500">{stats.toDeclare}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSections;
