import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Données collectées',
    body: `Nous collectons les informations que vous nous fournissez directement : nom, prénom, email, numéro de téléphone, documents d'identité (KYC), ainsi que les données générées par votre utilisation de la Plateforme (investissements, transactions, connexions).`,
  },
  {
    title: '2. Utilisation des données',
    body: `Vos données sont utilisées pour créer et gérer votre compte, vérifier votre identité (obligation KYC), traiter vos dépôts et retraits, calculer vos commissions de parrainage, vous envoyer des notifications par email (confirmations, codes OTP, alertes), et améliorer la sécurité de la Plateforme.`,
  },
  {
    title: '3. Partage des données',
    body: `Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec des prestataires strictement nécessaires au fonctionnement du service : hébergement (base de données, serveurs), envoi d'emails transactionnels, ou avec les autorités compétentes si la loi l'exige.`,
  },
  {
    title: '4. Documents KYC',
    body: `Les pièces d'identité soumises pour la vérification KYC sont stockées de façon sécurisée et utilisées uniquement à des fins de conformité réglementaire et de prévention de la fraude.`,
  },
  {
    title: '5. Cookies et données de session',
    body: `La Plateforme utilise des cookies/stockage local uniquement pour maintenir votre session de connexion et vos préférences d'affichage (thème clair/sombre). Aucun cookie publicitaire tiers n'est utilisé.`,
  },
  {
    title: '6. Conservation des données',
    body: `Vos données sont conservées tant que votre compte est actif, puis pendant la durée requise par les obligations légales et comptables applicables, avant suppression ou anonymisation.`,
  },
  {
    title: '7. Sécurité',
    body: `Nous mettons en œuvre des mesures techniques raisonnables (mots de passe hachés, authentification à deux facteurs, connexions chiffrées) pour protéger vos données contre tout accès non autorisé.`,
  },
  {
    title: '8. Vos droits',
    body: `Vous pouvez demander l'accès, la rectification ou la suppression de vos données personnelles en nous contactant à support@imc.com. La suppression de certaines données peut être limitée par nos obligations légales de conservation (notamment KYC et historique de transactions).`,
  },
  {
    title: '9. Modifications de cette politique',
    body: `Cette politique de confidentialité peut être mise à jour périodiquement. Toute modification significative vous sera communiquée.`,
  },
  {
    title: '10. Contact',
    body: `Pour toute question relative à vos données personnelles, contactez-nous à support@imc.com.`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Politique de confidentialité
        </h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>

        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="text-lg font-bold text-yellow-500 mb-2">{s.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-xs text-gray-600 border-t border-yellow-900/20 pt-6">
          Ce document est un modèle général et ne remplace pas un avis juridique. Il est recommandé de le faire réviser par un professionnel du droit adapté à votre juridiction avant un lancement public.
        </p>
      </div>
    </div>
  );
}
