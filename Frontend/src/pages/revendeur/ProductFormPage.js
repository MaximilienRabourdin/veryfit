import React, { useEffect, useState } from "react";
import axios from "axios";
import DynamicForm from "../components/DynamicForm";

const ProductFormPage = ({ productName }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/forms/${productName}`);
        setForm(response.data.form);
      } catch (error) {
        console.error("Erreur lors de la récupération du formulaire :", error);
      }
    };

    fetchForm();
  }, [productName]);

  const handleFormSubmit = async (formData) => {
    try {
      await axios.post("/api/forms/submit", {
        productName,
        userId: "currentUserId", // Remplacez par l'utilisateur connecté
        formData,
      });
      alert("Formulaire soumis avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    }
  };

  if (!form) return <p>Chargement...</p>;

  return <DynamicForm form={form} onSubmit={handleFormSubmit} />;
};

export default ProductFormPage;
