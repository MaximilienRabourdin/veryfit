import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useParams } from "react-router-dom";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import templatePdf from "../../medias/declaration_montage_template.pdf";

const DeclarationMontageForm = () => {
  const { orderId } = useParams();
  const [formData, setFormData] = useState({
    entreprise: "",
    responsableNom: "",
    responsableFonction: "",
    remarques: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const sigCanvas = useRef(null);
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
    try {
      const existingPdfBytes = await fetch(templatePdf).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const signatureImageBytes = await fetch(signatureImage).then((res) =>
        res.arrayBuffer()
      );
      const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

      page.drawText(formData.entreprise || "", {
        x: 60,
        y: height - 150,
        size: 12,
        font,
      });

      page.drawText(
        `${formData.responsableNom || ""} - ${
          formData.responsableFonction || ""
        }`,
        {
          x: 310,
          y: height - 150,
          size: 12,
          font,
        }
      );

      page.drawText(formData.remarques || "", {
        x: 60,
        y: height - 290,
        size: 11,
        font,
        maxWidth: 460,
        lineHeight: 14,
      });

      page.drawText(formData.date || "", {
        x: 60,
        y: height - 340,
        size: 12,
        font,
      });

      page.drawImage(signatureImageEmbed, {
        x: 320,
        y: height - 390,
        width: 200,
        height: 80,
      });

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: "application/pdf" });
    } catch (error) {
      console.error("❌ Erreur création PDF :", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !orderId) {
      alert("Erreur : utilisateur ou dossier inconnu.");
      return;
    }

    setLoading(true);

    try {
      const signatureImage = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const pdfFile = await generateSignedPDF(formData, signatureImage);
      if (!pdfFile) {
        setLoading(false);
        return;
      }

      const fileToSend = new File([pdfFile], "declaration_montage.pdf", {
        type: "application/pdf",
      });
      const formDataToSend = new FormData();
      formDataToSend.append("file", fileToSend);
      formDataToSend.append("userId", userId);
      formDataToSend.append("orderId", orderId);

      const response = await fetch(
        "http://veryfit-production.up.railway.app/upload/declaration-montage",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur serveur");

      setPdfUrl(data.fileUrl);
      alert("✅ Déclaration envoyée avec succès !");
    } catch (error) {
      console.error("❌ Erreur :", error);
      alert("Une erreur s’est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-darkBlue">
        Déclaration de montage
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block mb-4">
          Nom de l'entreprise :
          <input
            type="text"
            name="entreprise"
            value={formData.entreprise}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          Nom du responsable :
          <input
            type="text"
            name="responsableNom"
            value={formData.responsableNom}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          Fonction du responsable :
          <input
            type="text"
            name="responsableFonction"
            value={formData.responsableFonction}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          Remarques :
          <textarea
            name="remarques"
            value={formData.remarques}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </label>

        <label className="block mb-4">
          Date :
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="p-2 border rounded"
          />
        </label>

        <h2 className="text-xl font-semibold mb-2">Signature :</h2>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            width: 600,
            height: 150,
            className: "border border-gray-300 rounded w-full",
          }}
        />
        <button
          type="button"
          onClick={clearSignature}
          className="mt-2 bg-red-500 text-white py-1 px-3 rounded"
        >
          Effacer la signature
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? "Envoi en cours..." : "Signer et Envoyer"}
        </button>

        {pdfUrl && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h2 className="text-md font-semibold text-darkBlue">
              ✅ Document signé :
            </h2>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir le document
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default DeclarationMontageForm;
