import React from "react";

const RightSidebar = () => {
  return (
    <aside className="hidden lg:block w-80 bg-white p-6">
      <button className="bg-blue-500 text-white py-2 px-4 rounded mb-4 hover:bg-blue-600 transition">
        Créer une nouvelle échéance
      </button>
      <div className="bg-gray-100 p-4 rounded shadow mb-6">
        <h2 className="text-lg font-bold">Calendrier</h2>
        {/* Remplace ceci par un vrai calendrier */}
        <p>Calendrier ici</p>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-4">Prochaines échéances</h2>
        <ul>
          <li className="border-b py-2">Nom de l’événement - 01/01/24</li>
          <li className="border-b py-2">Nom de l’événement - 02/01/24</li>
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebar;
