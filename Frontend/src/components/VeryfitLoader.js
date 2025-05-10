import React from "react";

const VeryfitLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative w-[250px] h-[120px]">
        {/* Texte fixe */}
        <div className="absolute inset-0 z-10 flex items-center justify-center text-[2.5rem] font-bold text-red-600">
          VERYFIT
        </div>

        {/* Cadre tournant */}
        <div className="absolute inset-0 z-0 animate-spin-slow">
          <svg
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
          </svg>
        </div>
      </div>
    </div>
  );
};

export default VeryfitLoader;
