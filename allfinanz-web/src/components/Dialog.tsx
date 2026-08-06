import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ReactNode } from 'react';

interface DialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'default' | 'destructive';
}

export default function Dialog({
  children,
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'destructive',
}: DialogProps) {
  const confirmButtonClasses = {
    default: 'bg-emerald-300 border border-emerald-300/30 text-slate-950 hover:bg-emerald-200',
    destructive: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>}

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-black/60 backdrop-blur-sm fixed inset-0 animate-fadeIn" />

        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0d1117] border border-white/10 rounded-lg p-6 w-[90vw] max-w-md shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
          <AlertDialog.Title className="text-lg font-semibold text-white text-center">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-400 text-center">
            {description}
          </AlertDialog.Description>

          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel asChild>
              <button 
                className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild onClick={onConfirm}>
              <button
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] ${confirmButtonClasses[confirmVariant]}`}
              >
                {confirmText}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
