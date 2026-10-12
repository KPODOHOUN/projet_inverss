import { Link } from 'react-router-dom';

const POINTS = [
  'Packs d’investissement dès 25 $',
  'Dépôts et retraits 100 % en USDT',
  'Identité vérifiée et double authentification',
];

// Shared split layout for every auth screen: a brand panel on large screens,
// the page's own form on the right (and alone on mobile).
export default function AuthShell({ children }) {
  return (
    <div className="lux-page min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden border-r border-yellow-900/20">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <img src="/images/Gemini_Generated_Image_dm8veudm8veudm8v.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.08]" />
          <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.18),transparent)]" />
          <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.08),transparent)]" />
        </div>

        <Link to="/" className="relative inline-block w-fit">
          <img src="/logo-on-dark.png" alt="IMC Corporation" className="h-11 w-auto" />
        </Link>

        <div className="relative max-w-lg">
          <p className="lux-label !text-[#d4af37]/80 mb-5">IMC Corporation</p>
          <h2 className="lux-serif text-5xl xl:text-6xl font-semibold text-[#f4efe2] leading-[1.02] mb-10">
            Votre patrimoine mérite <span className="lux-gold-text italic">l&apos;excellence.</span>
          </h2>
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[#f4efe2]/65">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-500/10 border border-yellow-500/25 text-[#d4af37] text-xs">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#f4efe2]/30 max-w-md leading-relaxed">
          Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
        </p>
      </aside>

      <main className="relative flex items-center justify-center px-5 py-12 sm:px-8 overflow-hidden">
        <div className="absolute lg:hidden -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.14),transparent)] pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
