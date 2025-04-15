import axios from "axios";

export const fetchForm = async (productName) => {
  try {
    const response = await axios.get(`/api/forms/${productName}`);
    return response.data.form;
  } catch (error) {
    console.error("Erreur API :", error);
    throw error;
  }
};

export const submitForm = async (productName, formData) => {
  try {
    const response = await axios.post(`/api/forms/${productName}/submit`, formData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la soumission du formulaire :", error);
    throw error;
  }
};
