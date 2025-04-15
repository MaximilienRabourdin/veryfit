import React from "react";

const StepperCE = ({ steps, currentStep }) => {
  return (
    <div className="flex justify-between mb-6">
      {[...Array(steps)].map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-2 mx-1 rounded ${
            i <= currentStep ? "bg-red-600" : "bg-gray-300"
          }`}
        ></div>
      ))}
    </div>
  );
};

export default StepperCE;
