import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthWrapper from "./components/AuthWrapper";
import Login from "./pages/Login";
import CreateAccount from "./pages/CreateAccount";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Unauthorized from "./pages/Unauthorized";

import { auth } from "./firebaseConfig";

// Layouts
import RevendeurLayout from "./layouts/RevendeurLayout";
import ClientLayout from "./layouts/ClientLayout";
import FitLayout from "./layouts/FitLayout";

// Pages FIT
import FitDashboard from "./pages/fit/FitDashboard";
import FitCreateOrder from "./pages/fit/FitCreateOrder";
import CommandesList from "./pages/fit/ListeDesCommandes";
import ManageAccounts from "./pages/fit/ManageAccounts";
import FitValidateAccounts from "./pages/fit/FitValidateAccount";
import FitCreateAccount from "./pages/fit/FitCreateAccount";

// Pages Revendeur
import RevendeurDashboard from "./pages/revendeur/RevendeurDashboard";
import RevendeurOrders from "./pages/revendeur/RevendeurOrders";
import DeclarationMontageForm from "./pages/revendeur/DeclarationMontageForm";
import DeclarationCEPreview from "./pages/revendeur/DeclarationCEPreview";
import SignaturePage from "./pages/revendeur/SignaturePage";
import EtapeFormulaireCE from "./pages/EtapeFormulaireCE";
import { ToastContainer } from "react-toastify";

// Layouts
import CarrossierLayout from "./layouts/CarrossierLayout";

// Pages Carrossier
import CarrossierDashboard from "./pages/carrossier/CarrossierDashboard";
import CarrossierOrders from "./pages/carrossier/CarrossierOrders";
import CarrossierOrderDetails from "./pages/carrossier/CarrossierOrderDetails";
import DeclarationMontageCarrossier from "./pages/carrossier/DeclarationMontageCarrossierForm";
import DeclarationCECarrossier from "./pages/carrossier/DeclarationCECarrossier";
import FormulaireCarrossierProduit from "./pages/carrossier/FormulaireCarrossierProduit";
import EtapeFormulaireCECarrossier from "./pages/carrossier/EtapeFormulaireCECarrossier";

// Pages Client
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientOrders from "./pages/client/ClientOrders";
import ControlePeriodiqueForm from "./pages/revendeur/ControlePeriodiqueForm";
import UsersByRole from "./components/UsersByRole";
import OrderDetails from "./pages/revendeur/RevendeurOrders";

import GetFirebaseToken from "./components/GetFirebaseToken";
import FormulaireProduitPage from "./pages/FormulaireProduitPage";
import FitOrderDetails from "./pages/fit/FitOrderDetails";
import DeclarationMontagePreview from "./pages/fit/DeclarationMontagePreview";
import Confidentialite from "./pages/Confidentialite";

function App() {
  const logFirebaseToken = async () => {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken(true); // Récupère un nouveau token valide
    } else {
    }
  };

  logFirebaseToken();

  auth.onAuthStateChanged((user) => {
    if (user) {
    } else {
    }
  });
  return (
    <Router>
      <GetFirebaseToken />
      <AuthWrapper>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/users/:role" element={<UsersByRole />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/confidentialite" element={<Confidentialite />} />


          {/* Routes FIT */}
          <Route path="/fit/*" element={<FitLayout />}>
            <Route index element={<FitDashboard />} />
            <Route path="dashboard" element={<FitDashboard />} />
            <Route path="orders/:orderId" element={<FitOrderDetails />} />
            <Route
              path="orders/:orderId/declaration-montage"
              element={<DeclarationMontagePreview />}
            />
            <Route path="create-order" element={<FitCreateOrder />} />
            <Route path="fit-create-account" element={<FitCreateAccount />} />
            <Route path="commandes" element={<CommandesList />} />
            <Route path="manage-accounts" element={<ManageAccounts />} />
            <Route path="validate-accounts" element={<FitValidateAccounts />} />
          </Route>

          {/* Routes Revendeur */}
          <Route path="/revendeur/*" element={<RevendeurLayout />}>
            <Route index element={<RevendeurDashboard />} />
            <Route path="dashboard" element={<RevendeurDashboard />} />
            <Route path="orders" element={<RevendeurOrders />} />
            <Route path="orders/:orderId" element={<OrderDetails />} />
            <Route
              path="orders/:orderId/produits/:produitId"
              element={<FormulaireProduitPage />}
            />
            <Route
              path="orders/:orderId/step/:stepIndex"
              element={<EtapeFormulaireCE />}
            />
            <Route
              path="orders/:orderId/declaration-montage"
              element={<DeclarationMontageForm />}
            />

            <Route
              path="declaration-ce/:orderId"
              element={<DeclarationCEPreview />}
            />
            <Route
              path="controle-periodique/:productId"
              element={<ControlePeriodiqueForm />}
            />

            <Route path="signature" element={<SignaturePage />} />
          </Route>

          {/* Routes Carrossier */}
          <Route path="/carrossier/*" element={<CarrossierLayout />}>
            <Route index element={<CarrossierDashboard />} />
            <Route path="dashboard" element={<CarrossierDashboard />} />
            <Route path="orders" element={<CarrossierOrders />} />
            <Route
              path="orders/:orderId"
              element={<CarrossierOrderDetails />}
            />
            <Route
              path="orders/:orderId/produits/:produitId"
              element={<FormulaireCarrossierProduit />}
            />
            <Route
              path="orders/:orderId/step/:stepIndex"
              element={<EtapeFormulaireCECarrossier />}
            />

            <Route
              path="orders/:orderId/declaration-montage"
              element={<DeclarationMontageCarrossier />}
            />

            <Route
              path="declaration-ce/:orderId"
              element={<DeclarationCECarrossier />}
            />
          </Route>

          {/* Routes Client */}
          <Route path="/client/*" element={<ClientLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="orders" element={<ClientOrders />} />
          </Route>


          

          {/* Route pour 404 */}
          <Route path="*" element={<div>Page non trouvée - Erreur 404</div>} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthWrapper>
    </Router>
  );
}

export default App;
