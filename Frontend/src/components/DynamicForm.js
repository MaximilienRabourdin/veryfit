import React from "react";

const DynamicForm = ({ form, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  useEffect(() => {
    console.log("Produit sélectionné :", produit);
}, [produit]);

  return (
    <form onSubmit={handleSubmit}>
      {form.steps.map((step, index) => (
        <div key={index}>
          <h2>{step.title}</h2>
          {step.fields.map((field, idx) => (
            <div key={idx}>
              <label>{field.label}</label>
              {field.type === "radio" && (
                <div>
                  {field.options.map((option, optIdx) => (
                    <label key={optIdx}>
                      <input type="radio" name={field.label} value={option} required={field.required} />
                      {option}
                    </label>
                  ))}
                </div>
              )}
              {field.type === "number" && (
                <input type="number" name={field.label} required={field.required} placeholder={field.unit} />
              )}
              {field.type === "text" && (
                <input type="text" name={field.label} required={field.required} />
              )}
            </div>
          ))}
        </div>
      ))}
      <button type="submit">Soumettre</button>
    </form>
  );
};

export default DynamicForm;
