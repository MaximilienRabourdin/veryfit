import axios from "axios";
import { useEffect, useState } from "react";

const FormPage = ({ productName }) => {
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const handleInputChange = (stepIndex, fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [stepIndex]: {
        ...prevFormData[stepIndex],
        [fieldName]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/forms/submit", {
        productName,
        userId: "currentUserId", // Remplacez par l'ID utilisateur actuel
        formData,
      });
      alert("Formulaire soumis avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire :", error);
      alert("Une erreur est survenue lors de la soumission.");
    }
  };

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

  if (loading) return <p>Chargement du formulaire...</p>;

  if (!form) return <p>Aucun formulaire trouvé pour ce produit.</p>;

  return (
    <div>
      <h1>{productName} - Formulaire</h1>
      {form.steps.map((step, stepIndex) => (
        <div key={stepIndex}>
          <h2>{step.title}</h2>
          {step.fields.map((field, fieldIndex) => (
            <div key={fieldIndex}>
              <label>{field.label}</label>
              {/* Type radio */}
              {field.type === "radio" && (
                <div>
                  {field.options.map((option, optIdx) => (
                    <label key={optIdx}>
                      <input
                        type="radio"
                        name={`${stepIndex}-${field.label}`}
                        value={option}
                        onChange={(e) =>
                          handleInputChange(stepIndex, field.label, e.target.value)
                        }
                      />{" "}
                      {option}
                    </label>
                  ))}
                </div>
              )}
              {/* Type number */}
              {field.type === "number" && (
                <input
                  type="number"
                  placeholder={field.unit}
                  required={field.required}
                  onChange={(e) =>
                    handleInputChange(stepIndex, field.label, e.target.value)
                  }
                />
              )}
              {/* Type text */}
              {field.type === "text" && (
                <input
                  type="text"
                  required={field.required}
                  onChange={(e) =>
                    handleInputChange(stepIndex, field.label, e.target.value)
                  }
                />
              )}
            </div>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Soumettre</button>
    </div>
  );
};

export default FormPage;
