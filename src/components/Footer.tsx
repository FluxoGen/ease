import { Link } from 'react-router-dom';
import fluxogenMark from '../assets/fluxogen-mark.png';

const FLUXOGEN_URL = 'https://github.com/FluxoGen';
const CONTACT_EMAIL = 'fluxogentechnologies@gmail.com';

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-charcoal/10 bg-sand/60 dark:border-ivory/10 dark:bg-charcoal-soft/60">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <a
          href={FLUXOGEN_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-3.5 rounded-xl"
          aria-label="Ease is a product of FluxoGen"
        >
          <img src={fluxogenMark} alt="" width={44} height={44} className="h-11 w-11 shrink-0" />
          <span className="flex flex-col">
            <span className="text-xs text-muted dark:text-muted-dark">A product of</span>
            <span className="text-lg font-bold leading-tight tracking-tight text-charcoal group-hover:text-clay-dark dark:text-ivory dark:group-hover:text-clay">
              FluxoGen
            </span>
            <span className="text-xs italic text-muted dark:text-muted-dark">From spark to arc.</span>
          </span>
        </a>

        <nav
          aria-label="Footer"
          className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-charcoal/80 dark:text-ivory/80"
        >
          <Link to="/safety" className="hover:text-clay-dark dark:hover:text-clay">
            Safety info
          </Link>
          <Link to="/points" className="hover:text-clay-dark dark:hover:text-clay">
            All points
          </Link>
          <a
            href={FLUXOGEN_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-clay-dark dark:hover:text-clay"
          >
            About FluxoGen
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Ease%20feedback`}
            className="hover:text-clay-dark dark:hover:text-clay"
          >
            Contact us
          </a>
        </nav>

        <p className="mt-6 text-xs leading-relaxed text-muted dark:text-muted-dark">
          Point photos and instructions adapted from U.S. Department of Veterans Affairs
          public-domain patient education handouts. Illustrations for not-yet-reviewed points are
          original drawings. For wellness education only — not a substitute for medical care.
        </p>
        <p className="mt-3 text-xs text-muted dark:text-muted-dark">
          © 2026 FluxoGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
