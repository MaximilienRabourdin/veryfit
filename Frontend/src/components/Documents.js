import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Documents = ({ userRole }) => {
    const [documents, setDocuments] = useState([]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const q = query(collection(db, "documents"), where("roles", "array-contains", userRole));
                const snapshot = await getDocs(q);
                setDocuments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Erreur lors de la récupération des documents :", error);
            }
        };

        fetchDocuments();
    }, [userRole]);

    return (
        <div className="p-6 bg-lightGray min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Documents</h1>
            <table className="w-full bg-white shadow rounded">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="p-4 text-left">Nom</th>
                        <th className="p-4 text-left">Lien</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map((doc) => (
                        <tr key={doc.id} className="border-t">
                            <td className="p-4">{doc.name}</td>
                            <td className="p-4">
                                <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                                    Télécharger
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Documents;
