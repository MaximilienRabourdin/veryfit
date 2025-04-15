// pages/carrossier/DeclarationMontageCarrossier.js
import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import templatePdf from "../../medias/declaration_montage_template.pdf"; // même fichier que Revendeur

const DeclarationMontageCarrossier = () => {
  const { orderId } = useParams();
  const [formData, setFormData] = useState({
    entreprise: "",
    responsableNom: "",
    responsableFonction: "",
    remarques: "",
    date: new Date().toISOString().split("T")[0],
  });
  const sigCanvas = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const generateSignedPDF = async (formData, signatureImage) => {
    const existingPdfBytes = await fetch(templatePdf).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const signatureImageBytes = await fetch(signatureImage).then((res) => res.arrayBuffer());
    const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

    page.drawText(formData.entreprise || "", { x: 60, y: height - 150, size: 12, font });
    page.drawText(`${formData.responsableNom || ""} - ${formData.responsableFonction || ""}`, {
      x: 310,
      y: height - 150,
      size: 12,
      font,
    });
    page.drawText(formData.remarques || "", {
      x: 60,
      y: height - 290,
      size: 11,
      font,
      maxWidth: 460,
      lineHeight: 14,
    });
    page.drawText(formData.date || "", { x: 60, y: height - 340, size: 12, font });
    page.drawImage(signatureImageEmbed, { x: 320, y: height - 390, width: 200, height: 80 });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signatureImage = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      const pdfFile = await generateSignedPDF(formData, signatureImage);
      if (!pdfFile) return;

      const fileToSend = new File([pdfFile], "declaration_montage.pdf", { type: "application/pdf" });
      const formDataToSend = new FormData();
      formDataToSend.append("file", fileToSend);
      formDataToSend.append("orderId", orderId);

      const response = await fetch("http://localhost:5000/upload/declaration-montage", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur serveur");

      setPdfUrl(data.fileUrl);
      alert("✅ Déclaration envoyée !");
    } catch (err) {
      console.error("❌ Erreur :", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold text-darkBlue mb-4">Déclaration de montage (Carrossier)</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="entreprise"
          value={formData.entreprise}
          onChange={handleInputChange}
          placeholder="Entreprise"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="responsableNom"
          value={formData.responsableNom}
          onChange={handleInputChange}
          placeholder="Nom du responsable"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="responsableFonction"
          value={formData.responsableFonction}
          onChange={handleInputChange}
          placeholder="Fonction"
          className="w-full border p-2 rounded"
        />
        <textarea
          name="remarques"
          value={formData.remarques}
          onChange={handleInputChange}
          placeholder="Remarques"
          className="w-full border p-2 rounded"
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="w-full border p-2 rounded"
        />
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 600,
            height: 150,
            className: "border border-gray-300 rounded w-full",
          }}
        />
        <button type="button" onClick={clearSignature} className="text-red-600 mt-2">Effacer la signature</button>
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded" disabled={loading}>
          {loading ? "Envoi en cours..." : "Valider et envoyer"}
        </button>
        {pdfUrl && (
          <div className="mt-4">
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              Voir la déclaration générée
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default DeclarationMontageCarrossier;
