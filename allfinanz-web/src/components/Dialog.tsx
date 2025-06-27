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
    default: 'bg-sky-600 text-white hover:bg-sky-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>}

      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-black/50 fixed inset-0 animate-fadeIn" />

        <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-300 rounded-xl p-6 w-[90vw] max-w-sm shadow-lg">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-gray-600">
            {description}
          </AlertDialog.Description>

          <div className="flex justify-end gap-4 mt-6">
            <AlertDialog.Cancel asChild>
              <button 
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-gray-800"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild onClick={onConfirm}>
              <button
                className={`px-4 py-2 rounded text-white ${confirmButtonClasses[confirmVariant]}`}
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
