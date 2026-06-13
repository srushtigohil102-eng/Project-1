import { useState } from 'react';
import { useRejectLeave } from '../hooks/useLeave';
import { showSuccess, showError } from '../utils/toast';

interface RejectLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveId: string;
  employeeName: string;
  leaveDates: string;
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SpinnerIcon({ className = 'h-4 w-4 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function RejectLeaveModal({ isOpen, onClose, leaveId, employeeName, leaveDates }: RejectLeaveModalProps) {
  const rejectMutation = useRejectLeave();
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleClose = () => {
    if (!rejectMutation.isPending) {
      setReason('');
      setValidationError(null);
      setTouched(false);
      onClose();
    }
  };

  const handleConfirm = async () => {
    setTouched(true);

    if (reason.trim().length < 5) {
      setValidationError('Rejection reason must be at least 5 characters.');
      return;
    }

    setValidationError(null);

    try {
      await rejectMutation.mutateAsync({ id: leaveId, reason: reason.trim() });
      showSuccess('Leave rejected');
      handleClose();
    } catch {
      showError('Failed to reject leave');
    }
  };

  if (!isOpen) return null;

  const isReasonValid = reason.trim().length >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-[400px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            Reject Leave Request
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            onClick={handleClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{employeeName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{leaveDates}</p>
          </div>

          {validationError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 flex items-start gap-2">
              <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}

          <div>
            <label htmlFor="rejectReason" className="block text-sm font-semibold text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectReason"
              rows={4}
              placeholder="Enter the reason for rejection..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (touched) {
                  if (e.target.value.trim().length >= 5) {
                    setValidationError(null);
                  } else if (e.target.value.trim().length > 0) {
                    setValidationError('Rejection reason must be at least 5 characters.');
                  }
                }
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:border-red-500 focus:ring-red-500/20 resize-none"
            />
            <div className="flex justify-between items-start mt-1">
              {touched && !isReasonValid ? (
                <p className="text-xs text-red-600">Minimum 5 characters required</p>
              ) : (
                <span className="text-xs text-gray-400">Minimum 5 characters required</span>
              )}
              <span className="text-xs text-gray-500 shrink-0">{reason.length}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={rejectMutation.isPending}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={rejectMutation.isPending || (touched && !isReasonValid)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {rejectMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
              {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RejectLeaveModal;
