import React from "react";

const Confidentialite = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Politique de Confidentialité (RGPD)</h1>
      <p className="mb-4 text-sm text-gray-500">Dernière mise à jour : 11/05/2025</p>

      <p className="mb-4">
        Le site <strong>veryfit</strong>, accessible à l’adresse <a href="https://veryfit.fr" className="text-blue-600 underline">https://veryfit.fr</a>,
        est édité par <strong>FIT</strong>, situé(e) au <strong>6 Rue du Parc des Vergers, 91250 Tigery</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">1. Données personnelles collectées</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Nom, prénom</li>
        <li>Adresse e-mail</li>
        <li>Numéro de téléphone (si fourni)</li>
        <li>Message via le formulaire de contact</li>
        <li>Adresse IP (à des fins de sécurité ou de statistiques)</li>
        <li>Informations produit FIT en votre possession</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">2. Finalité de la collecte</h2>
      <p className="mb-4">
        Les données sont collectées uniquement dans les objectifs suivants :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Répondre à vos messages ou demandes de contact</li>
        <li>Vous envoyer des informations sur nos services, offres ou événements</li>
        <li>Améliorer la qualité du site (statistiques de visite)</li>
        <li>
          Vous informer sur le contrôle périodique de votre porte FIT, les mises à jour produit, les conseils d’utilisation et d’entretien
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">3. Base légale du traitement</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Votre consentement explicite (case à cocher lors de l’envoi de formulaire)</li>
        <li>Notre intérêt légitime à répondre à vos demandes</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">4. Durée de conservation des données</h2>
      <p className="mb-4">
        Les données sont conservées :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>3 ans maximum après le dernier contact</li>
        <li>Ou durant toute la période où l’utilisateur est en possession d’une porte FIT</li>
        <li>Ou jusqu'à votre demande de suppression</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">5. Destinataires des données</h2>
      <p className="mb-4">
        Vos données sont uniquement traitées par l’équipe <strong>FIT</strong> et ne sont jamais revendues, cédées ou partagées à des tiers sans votre accord.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">6. Hébergement des données</h2>
      <p className="mb-4">
        Toutes les données collectées via ce site sont hébergées en Europe par :
        <br />
        OVH – 2 rue Kellermann – 59100 Roubaix – France.
        <br />
        Les serveurs respectent les normes de sécurité en vigueur.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">7. Vos droits (RGPD)</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Droit d'accès</li>
        <li>Droit de rectification</li>
        <li>Droit à l'effacement</li>
        <li>Droit à la limitation du traitement</li>
        <li>Droit à l'opposition</li>
        <li>Droit à la portabilité</li>
      </ul>
      <p className="mb-4">
        Vous pouvez exercer ces droits à tout moment en nous contactant à l’adresse suivante : 📩 <strong>[adresse-email-contact@veryfit.fr]</strong>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">8. Cookies</h2>
      <p className="mb-4">
        Notre site peut utiliser des cookies :
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>À des fins statistiques (Google Analytics, etc.)</li>
        <li>Pour améliorer l’expérience utilisateur</li>
      </ul>
      <p className="mb-4">
        Lors de votre première visite, vous pouvez accepter ou refuser les cookies via la bannière Axeptio.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">9. Contact</h2>
      <p className="mb-4">
        Pour toute question relative à la confidentialité ou au traitement de vos données :
        <br />
        📩 <strong>contact@fit-doors.fr</strong>
        <br />
        📍 <strong>6 Rue du Parc des Vergers, 91250 Tigery</strong>
      </p>
    </div>
  );
};

export default Confidentialite;
