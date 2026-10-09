import { BookOpen, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import fluxogenMark from '../assets/fluxogen-mark.png';
import { AppBarTitle } from '../components/app/AppChrome';
import InfoCard from '../components/ui/InfoCard';
import { CONTACT_EMAIL, PRIVACY_URL, TERMS_URL } from '../data/library/shared';
import { usePageTitle } from '../hooks/usePageTitle';
import { appVersion } from '../native';

const link = 'inline-flex min-h-11 items-center font-semibold text-accent-strong underline underline-offset-2';

export default function About() {
  usePageTitle('About');
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => { appVersion().then(setVersion); }, []);

  return (
    <div className="max-w-3xl">
      <AppBarTitle title="About" backTo="/settings" pinned />
      <h1 className="sr-only">About Ease</h1>

      <section aria-label="Ease" className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-card app:shadow-none">
        <img src={fluxogenMark} alt="" width={48} height={48} className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <p className="text-xl font-extrabold leading-tight tracking-tight">Ease</p>
          <p className="text-sm text-ink-2">A product of FluxoGen{version ? ` · v${version}` : ''}</p>
        </div>
      </section>

      <div className="mt-4 space-y-4">
        <InfoCard id="privacy" title="Your privacy" icon={Lock}>
          <p>
            Ease has no sign-in, ads, analytics or tracking, and it works offline. The few things it remembers (your Settings) stay on this
            device only. Clearing the app's data or uninstalling removes them.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4">
            <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className={link}>Privacy policy</a>
            <a href={TERMS_URL} target="_blank" rel="noreferrer" className={link}>Terms of use</a>
          </p>
        </InfoCard>

        <InfoCard title="Credits" icon={BookOpen}>
          <p>
            Photos and point selections for the first routines come from public-domain patient education handouts by the VA Portland
            Health Care System and the VHA Office of Patient Centered Care (U.S. federal government works, 17 U.S.C. §105). Point locations
            follow the WHO Standard Acupuncture Point Locations (2008), checked against independent references and described in our own
            words. Other illustrations are original.
          </p>
          <p className="mt-3">Wellness education only, not medical advice. © 2026 FluxoGen. All rights reserved.</p>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Ease%20feedback`} className={`mt-1 ${link}`}>Send feedback</a>
        </InfoCard>
      </div>
    </div>
  );
}
