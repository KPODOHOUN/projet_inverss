import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

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
      <aside className="lux-light relative hidden lg:flex flex-col justify-between p-12 xl:p-16 overflow-hidden">

        <Link to="/" className="relative inline-block w-fit">
          <img src="/logo-on-light.png" alt="IMC Corporation" className="h-11 w-auto" />
        </Link>

        <div className="relative max-w-lg">
          <p className="lux-label !text-[#b45309] mb-5">IMC Corporation</p>
          <h2 className="lux-serif text-4xl font-semibold text-[#e7ebf2] leading-[1.02] mb-10">
            Votre patrimoine mérite <span className="lux-gold-text italic">l&apos;excellence.</span>
          </h2>
          <ul className="space-y-4">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[#e7ebf2]/65">
                <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#2563eb] text-white text-xs">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#e7ebf2]/30 max-w-md leading-relaxed">
          Les investissements comportent des risques. Les performances passées ne garantissent pas les résultats futurs.
        </p>
      </aside>

      <main className="relative flex items-center justify-center px-5 py-12 sm:px-8 overflow-hidden">
        <ThemeToggle className="absolute top-5 right-5" />
        {children}
      </main>
    </div>
  );
}
