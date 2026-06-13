import React, { useState, useMemo } from 'react';
import { useApplyLeave } from '../hooks/useLeave';
import { calculateLeaveDays } from '../utils/helpers';
import { showSuccess, showError } from '../utils/toast';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

interface FormErrors {
  leaveType?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
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

function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
  const applyLeaveMutation = useApplyLeave();

  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState: FormData = {
    leaveType: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  // Form resets on mount when the parent uses conditional rendering.

  // Duration auto-calculation
  const duration = useMemo(() => {
    if (!formData.fromDate || !formData.toDate) return null;
    return calculateLeaveDays(formData.fromDate, formData.toDate);
  }, [formData.fromDate, formData.toDate]);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, fromDate: value };
      // Auto-update To Date if it is before the From Date
      if (prev.toDate && prev.toDate < value) {
        updated.toDate = value;
      }
      return updated;
    });

    if (errors.fromDate) {
      setErrors((prev) => ({ ...prev, fromDate: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const todayStr = getTodayString();
    const newErrors: FormErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required.';
    }

    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required.';
    } else if (formData.fromDate < todayStr) {
      newErrors.fromDate = 'From date cannot be in the past.';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'To date is required.';
    } else if (formData.fromDate && formData.toDate < formData.fromDate) {
      newErrors.toDate = 'To date must be the same as or after From date.';
    }

    const trimmedReason = formData.reason.trim();
    if (!trimmedReason) {
      newErrors.reason = 'Reason is required.';
    } else if (trimmedReason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters.';
    } else if (trimmedReason.length > 200) {
      newErrors.reason = 'Reason cannot exceed 200 characters.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      await applyLeaveMutation.mutateAsync({
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: trimmedReason,
      });

      showSuccess('Leave request submitted!');
      onClose();
    } catch (err) {
      showError(`Failed to submit: ${(err as Error).message || 'Server error'}`);
    }
  };

  if (!isOpen) return null;

  const isSubmitDisabled =
    !formData.fromDate ||
    !formData.toDate ||
    !formData.reason.trim() ||
    applyLeaveMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark semi-transparent overlay covering full screen */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* White centered card */}
      <div className="relative w-full max-w-[480px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Apply for Leave <span aria-hidden="true">📅</span>
          </h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Leave Type (Dropdown select) */}
          <div>
            <label htmlFor="leaveType" className="block text-sm font-semibold text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              id="leaveType"
              value={formData.leaveType}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, leaveType: e.target.value }));
                if (errors.leaveType) setErrors((prev) => ({ ...prev, leaveType: undefined }));
              }}
              className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 ${
                errors.leaveType
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Earned Leave">Earned Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
            {errors.leaveType && (
              <p className="text-xs text-red-600 mt-1">{errors.leaveType}</p>
            )}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label htmlFor="fromDate" className="block text-sm font-semibold text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fromDate"
                min={getTodayString()}
                value={formData.fromDate}
                onChange={handleFromDateChange}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 ${
                  errors.fromDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {errors.fromDate && (
                <p className="text-xs text-red-600 mt-1">{errors.fromDate}</p>
              )}
            </div>

            {/* To Date */}
            <div>
              <label htmlFor="toDate" className="block text-sm font-semibold text-gray-700 mb-1">
                To Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="toDate"
                min={formData.fromDate || getTodayString()}
                value={formData.toDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, toDate: e.target.value }));
                  if (errors.toDate) setErrors((prev) => ({ ...prev, toDate: undefined }));
                }}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 ${
                  errors.toDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {errors.toDate && (
                <p className="text-xs text-red-600 mt-1">{errors.toDate}</p>
              )}
            </div>
          </div>

          {/* Number of Days (Auto calculated duration) */}
          {duration !== null && (
            <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Duration: {duration} {duration === 1 ? 'working day' : 'working days'}
            </div>
          )}

          {/* Reason (Textarea) */}
          <div>
            <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-1">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              rows={4}
              maxLength={200}
              placeholder="Please describe your reason..."
              value={formData.reason}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, reason: e.target.value }));
                if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
              }}
              required
              className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 resize-none ${
                errors.reason
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
            <div className="flex justify-between items-start mt-1">
              <div className="flex-1 mr-2">
                {errors.reason ? (
                  <p className="text-xs text-red-600">{errors.reason}</p>
                ) : (
                  <span className="text-xs text-gray-400">Must be 10-200 characters</span>
                )}
              </div>
              <span className="text-xs text-gray-500 shrink-0">
                {formData.reason.length}/200
              </span>
            </div>
          </div>

          {/* Actions Container */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={applyLeaveMutation.isPending}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {applyLeaveMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
              {applyLeaveMutation.isPending ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApplyLeaveModal;
