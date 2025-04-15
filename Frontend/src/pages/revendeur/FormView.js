import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Utilisé pour récupérer le nom du produit depuis l'URL
import axios from "axios";
import FormPage from "../../components/FormPage";

const FormView = () => {
  const { productName } = useParams(); // Récupère le nom du produit depuis l'URL
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/forms/${productName}`);
        setForm(response.data.form);
      } catch (error) {
        console.error("Erreur lors de la récupération du formulaire :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [productName]);

  if (loading) {
    return <p>Chargement du formulaire...</p>;
  }

  return <FormPage form={form} />;
};

export default FormView;
