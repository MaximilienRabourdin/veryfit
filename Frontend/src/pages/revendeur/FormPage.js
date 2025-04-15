import React, { useEffect, useState } from "react";
import axios from "axios";
import DynamicForm from "../../components/DynamicForm";

const FormPage = ({ productName }) => {
  const [formSteps, setFormSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`/api/forms/${productName}`);
        setFormSteps(response.data.steps);
      } catch (error) {
        console.error("Erreur lors de la récupération du formulaire :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [productName]);

  const handleSubmit = (formData) => {
    console.log("Données du formulaire soumises :", formData);
    // TODO: Envoyer les données au backend
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>Formulaire : {productName}</h1>
      <DynamicForm formSteps={formSteps} onSubmit={handleSubmit} />
    </div>
  );
};

export default FormPage;
