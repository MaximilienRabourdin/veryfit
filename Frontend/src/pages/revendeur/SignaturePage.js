import React, { useState } from "react";
import PdfSignatureUploader from "../../components/PdfSignatureUploader";

const SignaturePage = () => {
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightGray p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-darkBlue text-center mb-6">Signature de Document</h1>
        
        <PdfSignatureUploader onUploadSuccess={setUploadedFileUrl} />

        {uploadedFileUrl && (
          <div className="mt-6 p-4 bg-white rounded shadow-md">
            <h2 className="text-lg font-semibold">✅ Document signé :</h2>
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Voir le document signé
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignaturePage;
