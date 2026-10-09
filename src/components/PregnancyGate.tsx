import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Baby } from 'lucide-react';
import { toast } from 'sonner';
import { usePregnancy } from '../context/PregnancyContext';
import { Button } from './ui/Button';

export default function PregnancyGate({ open }: { open: boolean }) {
  const { setStatus } = usePregnancy();

  const choose = (value: 'yes' | 'no') => {
    setStatus(value);
    toast.success(
      value === 'yes'
        ? "Got it. We'll hide points traditionally avoided in pregnancy."
        : 'Got it. You can change this anytime in Safety.',
    );
  };

  return (
    <Dialog open={open} onClose={() => {}} transition className="relative z-40">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center p-3 sm:items-center sm:p-4">
        <DialogPanel className="w-full max-w-sm rounded-[28px] border border-line bg-card p-6 shadow-pop transition duration-200 ease-out data-closed:translate-y-6 data-closed:opacity-0 sm:data-closed:translate-y-0 sm:data-closed:scale-95">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-caution-tint text-caution">
            <Baby size={26} aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-ink">One quick question</DialogTitle>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Some points are traditionally avoided during pregnancy. Tell us and we'll keep them out of your way.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Button onClick={() => choose('no')}>I'm not pregnant</Button>
            <Button variant="secondary" onClick={() => choose('yes')}>I'm pregnant or not sure</Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
