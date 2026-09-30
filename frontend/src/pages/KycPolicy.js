import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Objet de cette politique',
    body: `IMC Corporation applique une procédure de vérification d'identité ("KYC" — Know Your Customer) conforme aux standards de lutte contre le blanchiment d'argent et le financement du terrorisme (LCB-FT). Cette vérification est une condition obligatoire pour accéder à certaines fonctionnalités de la Plateforme, notamment les dépôts, les retraits et le trading.`,
  },
  {
    title: '2. Obligation de vérification',
    body: `Tout utilisateur souhaitant déposer des fonds, investir ou retirer un solde doit compléter la vérification KYC. Un compte non vérifié peut consulter la Plateforme mais ne peut pas effectuer de transactions financières.`,
  },
  {
    title: '3. Documents requis',
    body: `La vérification standard requiert une pièce d'identité officielle en cours de validité (carte nationale d'identité, passeport, ou permis de conduire) et, selon le niveau requis, un justificatif de domicile ou une photo de vérification (selfie). IMC Corporation se réserve le droit de demander des documents complémentaires en cas de doute sur l'authenticité des informations fournies.`,
  },
  {
    title: '4. Traitement de la demande',
    body: `Chaque dossier est examiné par notre équipe de conformité. Le statut de vérification (en attente, approuvé, rejeté) est visible depuis votre espace personnel. En cas de rejet, le motif est communiqué et l'utilisateur peut soumettre une nouvelle demande corrigée.`,
  },
  {
    title: '5. Conservation et sécurité des données',
    body: `Les documents d'identité soumis sont stockés de façon sécurisée et ne sont utilisés qu'à des fins de vérification et de conformité réglementaire. Ils ne sont jamais partagés à des fins commerciales. Voir notre Politique de confidentialité pour le détail du traitement de vos données personnelles.`,
  },
  {
    title: '6. Refus, suspension et fraude',
    body: `IMC Corporation se réserve le droit de refuser, suspendre ou révoquer la vérification d'un compte en cas de documents falsifiés, d'incohérence manifeste entre les informations fournies et l'identité déclarée, ou de soupçon raisonnable de fraude. Un compte dont le KYC est révoqué perd l'accès aux dépôts, retraits et investissements jusqu'à régularisation.`,
  },
  {
    title: '7. Mise à jour des informations',
    body: `L'utilisateur s'engage à maintenir ses informations d'identité à jour et à signaler tout changement significatif (nom, document expiré, etc.) pouvant affecter la validité de sa vérification.`,
  },
  {
    title: '8. Contact',
    body: `Pour toute question relative à votre vérification KYC, contactez-nous à support@imc.com.`,
  },
];

export default function KycPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Politique KYC
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
