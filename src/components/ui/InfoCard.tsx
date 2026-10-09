import type { LucideIcon } from 'lucide-react';

/** A titled card with an icon, used on Safety, Settings and About. */
export default function InfoCard({ id, title, icon: Icon, tone = 'neutral', children }: { id?: string; title: string; icon: LucideIcon; tone?: 'neutral' | 'caution' | 'stop'; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="scroll-mt-24 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-card app:shadow-none">
      <h2 id={id ? `${id}-title` : undefined} className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-lg font-extrabold tracking-tight">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone === 'caution' ? 'bg-caution-tint text-caution' : tone === 'stop' ? 'bg-stop-tint text-stop' : 'bg-accent-tint text-accent-strong'}`}>
          <Icon size={20} aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-3 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}
