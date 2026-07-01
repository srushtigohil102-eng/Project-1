import React, { useState, useMemo } from 'react';
import { useApplyLeave } from '../hooks/useLeave';
import { showSuccess, showError } from '../utils/toast';
import useFocusTrap from '../hooks/useFocusTrap';
import useAuth from '../hooks/useAuth';

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  leaveType: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason: string;
}

interface FormErrors {
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
}

const LEAVE_TYPE_OPTIONS = [
  { value: 'Sick', label: 'Sick Leave' },
  { value: 'Casual', label: 'Casual Leave' },
  { value: 'Annual', label: 'Annual Leave' },
  { value: 'Maternity', label: 'Maternity Leave' },
  { value: 'Paternity', label: 'Paternity Leave' },
  { value: 'Unpaid', label: 'Unpaid Leave' },
  { value: 'Bereavement', label: 'Bereavement Leave' },
  { value: 'Study', label: 'Study Leave' },
];

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
  const { user } = useAuth();

  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState: FormData = {
    leaveType: 'Sick',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  const duration = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  }, [formData.startDate, formData.endDate]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, startDate: value };
      if (prev.endDate && prev.endDate < value) {
        updated.endDate = value;
      }
      return updated;
    });

    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const todayStr = getTodayString();
    const newErrors: FormErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    } else if (formData.startDate < todayStr) {
      newErrors.startDate = 'Start date cannot be in the past.';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required.';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be the same as or after Start date.';
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
        startDate: formData.startDate,
        endDate: formData.endDate,
        isHalfDay: formData.isHalfDay,
        reason: trimmedReason,
      });

      showSuccess('Leave request submitted!');
      onClose();
    } catch (err) {
      showError(`Failed to submit: ${(err as Error).message || 'Server error'}`);
    }
  };

  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  const isSubmitDisabled =
    !formData.startDate ||
    !formData.endDate ||
    !formData.reason.trim() ||
    applyLeaveMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div ref={focusTrapRef} role="dialog" className="relative w-full max-w-[480px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Apply for Leave
          </h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {user && (
          <div className="mt-3 mb-1 text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{user.name}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              {LEAVE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="text-xs text-red-600 mt-1">{errors.leaveType}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                min={getTodayString()}
                value={formData.startDate}
                onChange={handleStartDateChange}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 [color-scheme:light] ${
                  errors.startDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {errors.startDate && (
                <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                min={formData.startDate || getTodayString()}
                value={formData.endDate}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                  if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 [color-scheme:light] ${
                  errors.endDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {errors.endDate && (
                <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          {duration !== null && (
            <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              Duration: {duration} {duration === 1 ? 'day' : 'days'}
              {formData.isHalfDay && ' (Half Day)'}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHalfDay"
              checked={formData.isHalfDay}
              onChange={(e) => setFormData((prev) => ({ ...prev, isHalfDay: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isHalfDay" className="text-sm text-gray-700">
              Half Day
            </label>
          </div>

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
