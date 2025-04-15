import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("E-mail de réinitialisation envoyé !");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8">
      <div className="w-full max-w-md">
        <h2 className="text-xl md:text-2xl font-bold text-customBlue text-center mb-8">
          MOT DE PASSE OUBLIÉ
        </h2>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
          <button
            type="submit"
            className="w-full font-bold bg-red-600 text-white py-2 rounded-sm hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            RÉINITIALISER LE MOT DE PASSE
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
