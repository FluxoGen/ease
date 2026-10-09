import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Check } from 'lucide-react';
import { CHANNELS } from '../../data/library/shared';

/** Bottom sheet for picking a channel (the app's replacement for the website's dropdown). */
export default function ChannelSheet({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: string; onChange: (v: string) => void }) {
  const options = [['all', 'All channels'], ...Object.entries(CHANNELS).map(([k, v]) => [k, `${v}${k === 'EX' ? 's' : ''}`])];
  return (
    <Dialog open={open} onClose={onClose} transition className="relative z-50">
      <div className="fixed inset-0 bg-black/50 transition-opacity duration-200 data-closed:opacity-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center">
        <DialogPanel className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-[28px] border border-b-0 border-line bg-card pb-[env(safe-area-inset-bottom)] shadow-pop transition duration-200 ease-out data-closed:translate-y-full">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-line-strong" aria-hidden="true" />
          <DialogTitle className="px-5 pb-2 pt-3 text-lg font-extrabold tracking-tight">Channel</DialogTitle>
          <ul className="overflow-y-auto px-2 pb-3">
            {options.map(([k, label]) => (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => { onChange(k); onClose(); }}
                  aria-pressed={value === k}
                  className="flex min-h-14 w-full items-center justify-between rounded-2xl px-3 text-left text-[16px] font-semibold"
                >
                  <span className={value === k ? 'text-accent-strong' : ''}>{label}</span>
                  {value === k && <Check size={20} className="text-accent-strong" aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
