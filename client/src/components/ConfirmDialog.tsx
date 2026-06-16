import type { ReactNode } from 'react';
import useFocusTrap from '../hooks/useFocusTrap';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'blue' | 'green';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function SpinnerIcon({ className = 'h-4 w-4 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

const COLOR_CONFIG = {
  red: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  blue: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
  green: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  },
};

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'blue',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  const colors = COLOR_CONFIG[confirmColor];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={onCancel} />
      <div ref={focusTrapRef} role="dialog" className="relative w-full max-w-[380px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex flex-col items-center text-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.iconBg} mb-4`}>
            {confirmColor === 'red' ? (
              <svg className={`h-6 w-6 ${colors.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            ) : (
              <svg className={`h-6 w-6 ${colors.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <div className="mt-2 text-sm text-gray-500 leading-relaxed">{message}</div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${colors.button}`}
          >
            {isLoading && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
            {isLoading ? `${confirmText}...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
