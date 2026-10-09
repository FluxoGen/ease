import { Link } from 'react-router-dom';
import fluxogenMark from '../assets/fluxogen-mark.png';
import { PRIVACY_URL, TERMS_URL } from '../data/library/shared';

const FLUXOGEN_URL = 'https://github.com/FluxoGen';
const CONTACT_EMAIL = 'fluxogentechnologies@gmail.com';
const link = 'inline-flex min-h-11 min-w-11 items-center justify-center hover:text-accent-strong hover:underline underline-offset-2';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 md:px-8 wide:pb-10">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <a href={FLUXOGEN_URL} target="_blank" rel="noreferrer" className="group flex min-h-11 items-center gap-2.5" aria-label="Ease is a product of FluxoGen">
            <img src={fluxogenMark} alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="text-xs leading-tight text-ink-2">
              A product of
              <span className="block text-sm font-extrabold tracking-tight text-ink group-hover:text-accent-strong">FluxoGen</span>
            </span>
          </a>
          <nav aria-label="Footer" className="flex flex-wrap justify-end gap-x-4 text-xs font-medium text-ink-2">
            <Link to="/safety" className={link}>Safety</Link>
            <a href={FLUXOGEN_URL} target="_blank" rel="noreferrer" className={link}>About</a>
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className={link}>Privacy</a>
            <a href={TERMS_URL} target="_blank" rel="noreferrer" className={link}>Terms</a>
            <a href={`mailto:${CONTACT_EMAIL}?subject=Ease%20feedback`} className={link}>Contact</a>
          </nav>
        </div>
        <p className="mt-4 max-w-2xl text-[11px] leading-relaxed text-ink-2">
          Photos adapted from public-domain U.S. VA handouts; other illustrations are original. Wellness
          education only, not medical advice. © 2026 FluxoGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
