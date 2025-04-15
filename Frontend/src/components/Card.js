import React from "react";

const Card = ({ title, value, color }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md ${color}`}>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default Card;
