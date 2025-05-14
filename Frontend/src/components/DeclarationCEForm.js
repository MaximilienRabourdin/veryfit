import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument, rgb } from "pdf-lib";

const DeclarationCEForm = ({ onFinish }) => {
  const [formData, setFormData] = useState({
    entreprise: "",
    responsable: "",
    numeroSeriePorte: "",
    immatriculation: "",
    numeroChassis: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const sigCanvas = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = () => sigCanvas.current.clear();

  const generatePDF = async () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Ajoutez une signature.");
      return null;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    page.drawText("Déclaration de conformité CE", { x: 50, y: 360, size: 18 });
    page.drawText(`Entreprise : ${formData.entreprise}`, { x: 50, y: 320 });
    page.drawText(`Responsable : ${formData.responsable}`, { x: 50, y: 300 });
    page.drawText(`N° Série Porte : ${formData.numeroSeriePorte}`, {
      x: 50,
      y: 280,
    });
    page.drawText(`Immatriculation : ${formData.immatriculation}`, {
      x: 50,
      y: 260,
    });
    page.drawText(`Châssis : ${formData.numeroChassis}`, { x: 50, y: 240 });
    page.drawText(`Date : ${formData.date}`, { x: 50, y: 220 });

    const sigImage = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    const response = await fetch(sigImage);
    const imageBytes = await response.arrayBuffer();
    const pngImage = await pdfDoc.embedPng(imageBytes);

    page.drawImage(pngImage, {
      x: 50,
      y: 80,
      width: 200,
      height: 100,
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) return;

      const file = new File([pdf], "declaration_ce.pdf", {
        type: "application/pdf",
      });
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("type", "declaration_ce");

      const res = await fetch(
        "https://veryfit-backend.onrender.com/upload/declaration-ce",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!res.ok) throw new Error("Erreur serveur lors de l'envoi du PDF");

      const data = await res.json();
      setPdfUrl(data.fileUrl);
      alert("✅ Déclaration CE envoyée avec succès.");
      onFinish();
    } catch (err) {
      console.error("❌ Erreur lors de l'envoi CE:", err);
      alert("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-xl font-bold mb-4">Déclaration de Conformité CE</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.entries(formData).map(([key, value]) => (
          <input
            key={key}
            name={key}
            value={value}
            onChange={handleChange}
            placeholder={key}
            type={key === "date" ? "date" : "text"}
            className="w-full p-2 border rounded"
          />
        ))}

        <div>
          <label className="block mb-1">Signature :</label>
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 150,
              className: "border rounded w-full",
            }}
          />
          <button
            type="button"
            onClick={clearSignature}
            className="text-red-500 mt-2"
          >
            Effacer la signature
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Envoi..." : "Envoyer Déclaration CE"}
        </button>

        {pdfUrl && (
          <div className="mt-4">
            <p className="text-green-600">✅ PDF généré :</p>
            <a
              href={pdfUrl}
              target="_blank"
              className="text-blue-500 underline"
            >
              Voir le document
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default DeclarationCEForm;
