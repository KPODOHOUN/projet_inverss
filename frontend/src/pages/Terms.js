import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Acceptation des conditions',
    body: `En créant un compte ou en utilisant la plateforme IMC Corporation ("la Plateforme"), vous acceptez sans réserve les présentes Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la Plateforme.`,
  },
  {
    title: '2. Éligibilité',
    body: `Vous devez avoir au moins 18 ans et disposer de la pleine capacité juridique pour créer un compte. Vous êtes responsable de l'exactitude des informations fournies lors de l'inscription et de la vérification d'identité (KYC).`,
  },
  {
    title: '3. Compte utilisateur',
    body: `Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité effectuée depuis votre compte. Toute suspicion d'accès non autorisé doit être signalée immédiatement au support.`,
  },
  {
    title: '4. Investissements et risques',
    body: `Les rendements affichés (ROI) sont fondés sur les conditions actuelles des offres d'investissement et ne constituent pas une garantie de performance future. Tout investissement comporte un risque de perte, pouvant aller jusqu'à la perte totale du capital investi. La Plateforme ne fournit pas de conseil financier personnalisé — vous investissez sous votre propre responsabilité.`,
  },
  {
    title: '5. Dépôts et retraits',
    body: `Les dépôts s'effectuent en USDT vers l'adresse de portefeuille communiquée sur la Plateforme. Les retraits sont traités vers l'adresse fournie par l'utilisateur. IMC Corporation ne peut être tenue responsable des fonds envoyés vers une adresse incorrecte, un mauvais réseau blockchain, ou d'un délai de confirmation lié à la blockchain elle-même.`,
  },
  {
    title: '6. Programme de parrainage',
    body: `Les commissions de parrainage sont calculées et créditées selon le taux affiché sur la page Parrainage au moment de l'investissement du filleul. IMC Corporation se réserve le droit d'ajuster ce taux ou de suspendre un compte en cas d'utilisation frauduleuse du programme (auto-parrainage, faux comptes, etc.).`,
  },
  {
    title: '7. Utilisations interdites',
    body: `Il est interdit d'utiliser la Plateforme à des fins frauduleuses, de blanchiment d'argent, de créer plusieurs comptes pour contourner les limites, ou de tenter d'accéder de façon non autorisée aux systèmes de la Plateforme.`,
  },
  {
    title: '8. Suspension et résiliation',
    body: `IMC Corporation se réserve le droit de suspendre ou clôturer un compte en cas de violation des présentes conditions, de fraude suspectée, ou d'obligation légale ou réglementaire.`,
  },
  {
    title: '9. Limitation de responsabilité',
    body: `Dans la mesure permise par la loi, IMC Corporation ne pourra être tenue responsable des pertes indirectes, de la volatilité des marchés, des interruptions de service, ou de tout événement échappant à son contrôle raisonnable.`,
  },
  {
    title: '10. Modification des conditions',
    body: `Ces conditions peuvent être mises à jour à tout moment. Les utilisateurs seront informés des changements significatifs. La poursuite de l'utilisation de la Plateforme après modification vaut acceptation des nouvelles conditions.`,
  },
  {
    title: '11. Contact',
    body: `Pour toute question relative à ces conditions, contactez-nous à support@imc.com.`,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Conditions d'utilisation
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
