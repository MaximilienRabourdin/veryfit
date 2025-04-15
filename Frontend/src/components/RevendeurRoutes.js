import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

const RevendeurRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        const claims = tokenResult.claims;

        if (!claims.isApproved || claims.role !== "Revendeur") {
          navigate("/unauthorized"); // Rediriger si non approuvé ou mauvais rôle
        }
      } else {
        navigate("/login"); // Rediriger si l'utilisateur n'est pas connecté
      }
    };

    checkAuth();
  }, [navigate]);

  return children;
};

export default RevendeurRoute;
