// ✅ Nouvelle version complète de DeclarationMontageCarrossierForm.js

import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { db } from "../../firebaseConfig";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://veryfit-production.up.railway.app";

const DeclarationMontageCarrossierForm = () => {
  const { orderId } = useParams();
  const [form, setForm] = useState({
    nomCarrossier: "",
    dateMontage: "",
    numeroSerie: "",
    observations: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const sigCanvasRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const dossierRef = doc(db, "dossiers", orderId);
      const snap = await getDoc(dossierRef);
      if (!snap.exists()) return;

      const dossier = snap.data();
      if (dossier.declarationMontageData) {
        setForm(dossier.declarationMontageData);
        setSubmitted(true);
      }
    };
    fetchData();
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    sigCanvasRef.current.clear();
  };

  const handleSubmit = async () => {
    try {
      const signatureData = sigCanvasRef.current
        ? sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png")
        : null;

      const fullForm = {
        ...form,
        signature: signatureData,
      };

      const dossierRef = doc(db, "dossiers", orderId);
      await updateDoc(dossierRef, {
        declarationMontageData: fullForm,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));

      const response = await fetch(
        `${API_BASE_URL}/api/dossiers/generate/declaration-montage-carrossier/${orderId}`,
        { method: "GET" }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Erreur API:", data);
        throw new Error(data?.error || "Erreur inconnue lors de la génération du PDF");
      }

      await addDoc(collection(getFirestore(), "notifications"), {
        type: "declarationMontage_carrossier",
        dossierId: orderId,
        message: `🧾 Déclaration de montage carrossier enregistrée pour le dossier ${orderId}`,
        read: false,
        createdAt: new Date(),
      });

      setSubmitted(true);
      alert("✅ Déclaration enregistrée et envoyée à FIT !");
    } catch (error) {
      console.error("❌ Erreur enregistrement :", error);
      alert("❌ Une erreur est survenue : " + error.message);
    }
  };

  if (submitted)
    return (
      <div className="p-6 bg-white shadow rounded max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-green-600 mb-4">
          ✅ Déclaration de montage enregistrée
        </h2>
        <p className="mb-4 text-gray-700">Merci pour votre envoi.</p>
      </div>
    );

  return (
    <div className="p-6 bg-white shadow rounded max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">
        🧾 Déclaration de montage (Carrossier)
      </h2>

      <div className="space-y-4">
        <input
          name="nomCarrossier"
          type="text"
          placeholder="Nom du carrossier"
          value={form.nomCarrossier}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="dateMontage"
          type="date"
          value={form.dateMontage}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="numeroSerie"
          type="text"
          placeholder="Numéro de série"
          value={form.numeroSerie}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <textarea
          name="observations"
          placeholder="Observations (facultatif)"
          value={form.observations}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        ></textarea>

        <div>
          <p className="font-medium mb-2">Signature du carrossier :</p>
          <div className="border border-gray-300 p-2 rounded bg-white">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "sigCanvas w-full h-52",
              }}
            />
          </div>
          <button
            onClick={handleClear}
            className="mt-2 text-sm text-red-500 hover:underline"
          >
            Effacer la signature
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mt-4"
        >
          ✅ Enregistrer la déclaration
        </button>
      </div>
    </div>
  );
};

export default DeclarationMontageCarrossierForm;
