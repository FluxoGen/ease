import { Link } from 'react-router-dom';
import fluxogenMark from '../assets/fluxogen-mark.png';

const FLUXOGEN_URL = 'https://github.com/FluxoGen';
const CONTACT_EMAIL = 'fluxogentechnologies@gmail.com';

const linkClass = 'hover:text-clay-dark hover:underline dark:hover:text-clay';

export default function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-sand/60 dark:border-ivory/10 dark:bg-charcoal-soft/60">
      <div className="mx-auto w-full max-w-xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <a
            href={FLUXOGEN_URL}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2.5"
            aria-label="Ease is a product of FluxoGen"
          >
            <img src={fluxogenMark} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="text-xs leading-tight text-muted dark:text-muted-dark">
              A product of
              <span className="block text-sm font-bold tracking-tight text-charcoal group-hover:text-clay-dark dark:text-ivory dark:group-hover:text-clay">
                FluxoGen
              </span>
            </span>
          </a>
          <nav
            aria-label="Footer"
            className="flex flex-wrap justify-end gap-x-3.5 gap-y-1 text-xs text-charcoal/75 dark:text-ivory/75"
          >
            <Link to="/safety" className={linkClass}>
              Safety
            </Link>
            <a href={FLUXOGEN_URL} target="_blank" rel="noreferrer" className={linkClass}>
              About
            </a>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Ease%20feedback`} className={linkClass}>
              Contact
            </a>
          </nav>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted dark:text-muted-dark">
          Photos adapted from public-domain U.S. VA handouts; other illustrations are original.
          Wellness education only — not medical advice. © 2026 FluxoGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
