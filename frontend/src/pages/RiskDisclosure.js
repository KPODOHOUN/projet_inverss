import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Avertissement général',
    body: `Investir comporte des risques, y compris la perte totale du capital investi. Avant d'utiliser la Plateforme IMC Corporation, vous devez comprendre et accepter les risques décrits ci-dessous. N'investissez jamais une somme que vous ne pouvez pas vous permettre de perdre.`,
  },
  {
    title: '2. Aucune garantie de rendement',
    body: `Les taux de rendement (ROI) affichés sur la Plateforme sont indicatifs et fondés sur les conditions actuelles des offres. Ils ne constituent en aucun cas une promesse, une garantie ou un engagement contractuel de performance future. Les performances passées ne préjugent pas des performances futures.`,
  },
  {
    title: '3. Risque de perte en capital',
    body: `Tout investissement effectué via la Plateforme peut perdre de la valeur, partiellement ou totalement. IMC Corporation ne garantit ni la préservation ni la restitution intégrale du capital investi.`,
  },
  {
    title: '4. Risques liés aux actifs numériques (USDT)',
    body: `Les dépôts et retraits s'effectuent en USDT sur la blockchain. Ces opérations sont irréversibles une fois confirmées sur le réseau : une erreur d'adresse, de réseau (TRC20/ERC20/BEP20) ou de montant de la part de l'utilisateur peut entraîner une perte définitive des fonds, sans possibilité de recours contre IMC Corporation. Les actifs numériques sont également soumis à un risque de volatilité, de défaillance technique du réseau blockchain, et à un risque réglementaire propre à chaque juridiction.`,
  },
  {
    title: '5. Absence de garantie de dépôt',
    body: `Contrairement à un compte bancaire traditionnel, les fonds détenus sur la Plateforme ne sont couverts par aucun mécanisme de garantie des dépôts ou d'assurance étatique. En cas de défaillance de la Plateforme, l'utilisateur supporte le risque de perte de ses avoirs.`,
  },
  {
    title: '6. Risque de liquidité',
    body: `Certains packs d'investissement comportent une durée fixe pendant laquelle les fonds sont engagés. Une clôture anticipée, lorsqu'elle est proposée, peut être soumise à des conditions et ne garantit pas la récupération du rendement initialement projeté.`,
  },
  {
    title: '7. Risque réglementaire',
    body: `Le cadre légal applicable aux plateformes d'investissement et aux actifs numériques évolue et varie selon les pays. IMC Corporation ne garantit pas que ses services sont autorisés ou licenciés dans toutes les juridictions. Il appartient à chaque utilisateur de vérifier la conformité de l'utilisation de la Plateforme avec la réglementation de son pays de résidence.`,
  },
  {
    title: '8. Absence de conseil financier',
    body: `Les informations, simulations et statistiques présentées sur la Plateforme sont fournies à titre informatif uniquement et ne constituent pas un conseil en investissement personnalisé. IMC Corporation n'est pas un conseiller financier agréé. Chaque utilisateur est seul responsable de ses décisions d'investissement et est invité à consulter un professionnel indépendant avant d'investir.`,
  },
  {
    title: '9. Programme de parrainage',
    body: `Les commissions de parrainage sont calculées sur les montants effectivement investis par les filleuls et ne constituent pas une source de revenu garantie. Elles dépendent entièrement de l'activité réelle du réseau de parrainage de l'utilisateur.`,
  },
  {
    title: '10. Limitation de responsabilité',
    body: `Dans les limites permises par la loi applicable, IMC Corporation, ses dirigeants et employés ne pourront être tenus responsables des pertes financières résultant de l'utilisation de la Plateforme, de la volatilité des marchés, d'une décision d'investissement de l'utilisateur, ou d'un événement technique, réglementaire ou de force majeure échappant à son contrôle raisonnable.`,
  },
  {
    title: '11. Acceptation des risques',
    body: `En créant un compte et en utilisant la Plateforme, vous reconnaissez avoir lu, compris et accepté l'ensemble des risques décrits dans le présent document.`,
  },
  {
    title: '12. Contact',
    body: `Pour toute question relative à cet avertissement, contactez-nous à support@imc.com.`,
  },
];

export default function RiskDisclosure() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-yellow-600 hover:text-yellow-400 font-semibold text-sm tracking-widest uppercase transition-colors group">
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span>
          Retour à l'accueil
        </Link>

        <h1 className="text-3xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          Avertissement sur les risques
        </h1>
        <p className="text-gray-500 text-sm mb-10">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>

        <div className="mb-10 p-4 bg-red-950/30 border border-red-800/40 rounded text-red-300 text-sm font-semibold">
          ⚠ Les investissements comportent un risque de perte, pouvant aller jusqu'à la perte totale du capital investi. N'investissez que ce que vous pouvez vous permettre de perdre.
        </div>

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
