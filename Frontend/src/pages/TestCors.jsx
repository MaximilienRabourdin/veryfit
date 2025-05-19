// src/pages/TestCors.jsx

import { useEffect } from "react";

const TestCors = () => {
  useEffect(() => {
    fetch("https://veryfit-backend.onrender.com/api/custom-claims/getClaims/TEST_UID", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => console.log("✅ Réponse backend :", data))
      .catch((err) => console.error("❌ Erreur CORS :", err));
  }, []);

  return <div>Test CORS en cours... regarde la console</div>;
};

export default TestCors;
