import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePregnancy } from '../context/PregnancyContext';

export default function PregnancyGate({ open }: { open: boolean }) {
  const { setStatus } = usePregnancy();

  const choose = (value: 'yes' | 'no') => {
    setStatus(value);
    toast.success(
      value === 'yes'
        ? "Got it — we'll hide points traditionally avoided during pregnancy."
        : "Got it — you'll see all points. Change this anytime from Safety info.",
    );
  };

  return (
    <Dialog open={open} onClose={() => {}} transition className="relative z-20">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-200 data-closed:opacity-0"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
        <DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition duration-200 ease-out data-closed:translate-y-4 data-closed:opacity-0 sm:data-closed:translate-y-0 sm:data-closed:scale-95 dark:bg-[#1c2b29]">
          <div className="mb-3 flex items-center gap-2 text-warn-600 dark:text-warn-500">
            <AlertTriangle size={20} />
            <DialogTitle className="font-bold text-black dark:text-white">
              Quick check before you start
            </DialogTitle>
          </div>
          <p className="mb-5 text-sm text-black/70 dark:text-white/70">
            Are you pregnant, or think you might be? A few points are traditionally avoided
            during pregnancy — we'll hide those for you if so.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="flex-1 rounded-lg bg-warn-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-warn-600"
              onClick={() => choose('yes')}
            >
              Yes / not sure
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-black/10 px-4 py-2.5 text-sm font-semibold text-black hover:bg-black/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              onClick={() => choose('no')}
            >
              No
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
