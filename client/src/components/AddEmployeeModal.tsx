import { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateEmployee } from '../hooks/useEmployees';
import { checkEmailAvailable } from '../services/apiService';
import type { EmployeeRole } from '../services/apiService';
import { showSuccess } from '../utils/toast';
import useFocusTrap from '../hooks/useFocusTrap';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary: string;
  role: EmployeeRole;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  salary?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}

const ROLE_OPTIONS: { value: EmployeeRole; label: string }[] = [
  { value: 'Employee', label: 'Employee' },
  { value: 'Manager', label: 'Manager' },
  { value: 'HR', label: 'HR' },
  { value: 'Admin', label: 'Admin' },
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const DEPARTMENT_OPTIONS = ['Engineering', 'Design', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'] as const;

const FORM_SESSION_KEY = 'hrms_add_employee_form';

const initialFormState: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  department: '',
  designation: '',
  joiningDate: '',
  salary: '',
  role: 'Employee',
  password: '',
  confirmPassword: '',
};

function formatIndianCurrency(amount: number): string {
  const numStr = Math.round(amount).toString();
  if (numStr.length <= 3) return numStr;
  const lastThree = numStr.slice(-3);
  const rest = numStr.slice(0, -3);
  const groups: string[] = [];
  let remaining = rest;
  while (remaining.length > 0) {
    if (remaining.length <= 2) {
      groups.unshift(remaining);
      break;
    }
    groups.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }
  return groups.join(',') + ',' + lastThree;
}

function getPasswordStrength(password: string): { label: string; barColor: string; barWidth: string; textColor: string } {
  if (!password) return { label: '', barColor: '', barWidth: 'w-0', textColor: '' };
  if (password.length < 8) return { label: 'Weak', barColor: 'bg-red-500', barWidth: 'w-1/4', textColor: 'text-red-600' };
  let types = 0;
  if (/[a-z]/.test(password)) types++;
  if (/[A-Z]/.test(password)) types++;
  if (/[0-9]/.test(password)) types++;
  if (/[^a-zA-Z0-9]/.test(password)) types++;
  if (types <= 1) return { label: 'Weak', barColor: 'bg-red-500', barWidth: 'w-1/4', textColor: 'text-red-600' };
  if (types === 2) return { label: 'Medium', barColor: 'bg-amber-500', barWidth: 'w-2/4', textColor: 'text-amber-600' };
  return { label: 'Strong', barColor: 'bg-green-500', barWidth: 'w-3/4', textColor: 'text-green-600' };
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

function EyeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const createEmployeeMutation = useCreateEmployee();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  const step1Ref = useRef<HTMLInputElement>(null);
  const step2Ref = useRef<HTMLSelectElement>(null);
  const step3Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem(FORM_SESSION_KEY);
      if (saved) {
        setShowRestorePrompt(true);
      } else {
        setFormData(initialFormState);
        setStep(1);
        setErrors({});
        setApiError(null);
        setEmailStatus('idle');
        setIsDirty(false);
        setShowCloseConfirm(false);
      }
    }
  }, [isOpen]);

  const handleRestoreYes = useCallback(() => {
    const saved = sessionStorage.getItem(FORM_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as FormData;
        setFormData(parsed);
        setIsDirty(true);
      } catch {
        // corrupted data, start fresh
      }
    }
    setShowRestorePrompt(false);
  }, []);

  const handleRestoreNo = useCallback(() => {
    sessionStorage.removeItem(FORM_SESSION_KEY);
    setFormData(initialFormState);
    setIsDirty(false);
    setShowRestorePrompt(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 1) step1Ref.current?.focus();
      else if (step === 2) step2Ref.current?.focus();
      else if (step === 3) step3Ref.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus('idle');
      return;
    }

    if (emailDebounceRef.current) {
      clearTimeout(emailDebounceRef.current);
    }

    setEmailStatus('checking');

    emailDebounceRef.current = setTimeout(async () => {
      try {
        const result = await checkEmailAvailable(email);
        setEmailStatus(result.available ? 'available' : 'unavailable');
      } catch {
        setEmailStatus('idle');
      }
    }, 800);

    return () => {
      if (emailDebounceRef.current) {
        clearTimeout(emailDebounceRef.current);
      }
    };
  }, [formData.email]);

  useEffect(() => {
    if (isDirty) {
      sessionStorage.setItem(FORM_SESSION_KEY, JSON.stringify(formData));
    }
  }, [formData, isDirty]);

  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (!isDirty) setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (formData.phoneNumber && !/^\d*$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must contain only digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.department) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required.';
    }

    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required.';
    } else if (formData.joiningDate < getTodayString()) {
      newErrors.joiningDate = 'Joining date cannot be in the past.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.salary || Number(formData.salary) <= 0) {
      newErrors.salary = 'Salary must be a positive number.';
    }

    if (!formData.role) {
      newErrors.role = 'System role is required.';
    }

    if (!formData.password) {
      newErrors.password = 'Temporary password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setApiError(null);
    setErrors({});

    try {
      await createEmployeeMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber || '',
        role: formData.role,
        department: formData.department,
        designation: formData.designation.trim(),
        salary: Number(formData.salary),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        joiningDate: formData.joiningDate,
        password: formData.password,
      });

      sessionStorage.removeItem(FORM_SESSION_KEY);
      onClose();
      showSuccess('Employee added successfully!');
      onSuccess();
    } catch (err) {
      const error = err as Error & { body?: { message?: string; errors?: Array<{ field: string; message: string }> } };
      const body = error.body;

      if (body?.message === 'Email already exists') {
        setErrors((prev) => ({ ...prev, email: 'Email already exists' }));
        setStep(1);
        return;
      }

      if (body?.errors && Array.isArray(body.errors)) {
        const newErrors: FormErrors = {};
        for (const fe of body.errors) {
          if (fe.field === 'firstName') newErrors.firstName = fe.message;
          else if (fe.field === 'lastName') newErrors.lastName = fe.message;
          else if (fe.field === 'email') newErrors.email = fe.message;
          else if (fe.field === 'department') newErrors.department = fe.message;
          else if (fe.field === 'designation') newErrors.designation = fe.message;
          else if (fe.field === 'salary') newErrors.salary = fe.message;
          else if (fe.field === 'password') newErrors.password = fe.message;
        }
        setErrors(newErrors);

        if (newErrors.email) setStep(1);
        else if (newErrors.department || newErrors.designation || newErrors.joiningDate) setStep(2);
        return;
      }

      setApiError(error.message || 'Failed to add employee');
    }
  };

  const handleClose = () => {
    if (createEmployeeMutation.isPending) return;

    if (isDirty || showRestorePrompt) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = useCallback(() => {
    sessionStorage.removeItem(FORM_SESSION_KEY);
    setShowCloseConfirm(false);
    onClose();
  }, [onClose]);

  const handleCancelClose = useCallback(() => {
    setShowCloseConfirm(false);
  }, []);

  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen) return null;

  const isStep1Valid =
    formData.firstName.trim().length >= 1 &&
    formData.lastName.trim().length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    emailStatus !== 'unavailable' &&
    emailStatus !== 'checking';

  const isStep2Valid =
    formData.department !== '' &&
    formData.designation.trim().length > 0 &&
    formData.joiningDate !== '' &&
    formData.joiningDate >= getTodayString();

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Personal Info' },
      { num: 2, label: 'Department & Role' },
      { num: 3, label: 'Salary & Access' },
    ];

    return (
      <div className="flex items-center justify-center mb-6 pt-2">
        {steps.map((s, index) => {
          const isCompleted = step > s.num;
          const isCurrent = step === s.num;

          let circleClass: string;
          let textClass: string;
          if (isCompleted) {
            circleClass = 'bg-blue-600 border-blue-600';
            textClass = 'text-white';
          } else if (isCurrent) {
            circleClass = 'border-2 border-blue-600 bg-white';
            textClass = 'text-blue-600';
          } else {
            circleClass = 'border-2 border-gray-300 bg-white';
            textClass = 'text-gray-400';
          }

          const labelClass = isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-400';

          return (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${circleClass}`}>
                  {isCompleted ? (
                    <CheckIcon className="h-4 w-4 text-white" />
                  ) : (
                    <span className={`text-xs font-bold ${textClass}`}>{s.num}</span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${labelClass}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 mt-[-1.25rem] ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs"
        onClick={handleClose}
      />
      <div ref={focusTrapRef} role="dialog" className="relative flex w-full max-w-lg mx-4 flex-col rounded-2xl bg-white shadow-2xl border border-gray-150 transition-all max-h-[90vh]">
        {/* STICKY HEADER */}
        <div className="flex items-center justify-between shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
          <button
            type="button"
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            onClick={handleClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {showCloseConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50" onClick={handleCancelClose} />
            <div className="relative w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-2xl border border-gray-150">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                <p className="mt-2 text-sm text-gray-500">You have unsaved changes. Are you sure you want to close? Your data will be lost.</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancelClose}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClose}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STICKY STEP INDICATOR */}
        <div className="shrink-0 px-6 pt-4">
          {renderStepIndicator()}
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
        {showRestorePrompt && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200 flex items-center justify-between gap-3">
            <span>You have unsaved form data from before. Would you like to continue where you left off?</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreYes}
                className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleRestoreNo}
                className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        )}
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 flex items-start gap-2">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={step1Ref}
                  type="text"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateField('firstName', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.firstName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.lastName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 pr-8 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {emailStatus === 'checking' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                )}
                {emailStatus === 'available' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {emailStatus === 'unavailable' && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </div>
              {emailStatus === 'available' && (
                <p className="text-xs text-green-600 mt-1">Email is available</p>
              )}
              {emailStatus === 'unavailable' && (
                <p className="text-xs text-red-600 mt-1">Email already in use</p>
              )}
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      updateField('phoneNumber', e.target.value);
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.phoneNumber
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 [color-scheme:light]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                ref={step2Ref}
                id="department"
                value={formData.department}
                onChange={(e) => updateField('department', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 ${
                  errors.department
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                <option value="">Select department</option>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.department && <p className="text-xs text-red-600 mt-1">{errors.department}</p>}
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-semibold text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="designation"
                placeholder="Senior Software Engineer"
                value={formData.designation}
                onChange={(e) => updateField('designation', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.designation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.designation && <p className="text-xs text-red-600 mt-1">{errors.designation}</p>}
            </div>

            <div>
              <label htmlFor="joiningDate" className="block text-sm font-semibold text-gray-700 mb-1">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="joiningDate"
                min={getTodayString()}
                value={formData.joiningDate}
                onChange={(e) => updateField('joiningDate', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 [color-scheme:light] ${
                  errors.joiningDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.joiningDate && <p className="text-xs text-red-600 mt-1">{errors.joiningDate}</p>}
            </div>

          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Compensation</h4>

            <div>
              <label htmlFor="salary" className="block text-sm font-semibold text-gray-700 mb-1">
                Monthly Salary <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
                <input
                  ref={step3Ref}
                  type="number"
                  id="salary"
                  placeholder="80000"
                  min={1}
                  value={formData.salary}
                  onChange={(e) => updateField('salary', e.target.value)}
                  className={`w-full rounded-lg border pl-8 pr-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.salary
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
              </div>
              {errors.salary && <p className="text-xs text-red-600 mt-1">{errors.salary}</p>}
              {formData.salary && Number(formData.salary) >= 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Annual CTC: ₹{formatIndianCurrency(Number(formData.salary) * 12)}
                </p>
              )}
            </div>

            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide pt-2">System Access</h4>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                System Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1.5">
                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getPasswordStrength(formData.password).barColor} ${getPasswordStrength(formData.password).barWidth}`} />
                  </div>
                  <p className={`text-xs font-medium mt-0.5 ${getPasswordStrength(formData.password).textColor}`}>
                    {getPasswordStrength(formData.password).label}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">User will change this on first login.</p>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Re-enter the password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Review Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900 truncate">{formData.firstName} {formData.lastName}</span>
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 truncate">{formData.email || '—'}</span>
                <span className="text-gray-500">Department:</span>
                <span className="font-medium text-gray-900">{formData.department || '—'}</span>
                <span className="text-gray-500">Designation:</span>
                <span className="font-medium text-gray-900 truncate">{formData.designation || '—'}</span>
                <span className="text-gray-500">Salary:</span>
                <span className="font-medium text-gray-900">
                  {formData.salary ? `₹${formatIndianCurrency(Number(formData.salary))}/mo` : '—'}
                </span>
                <span className="text-gray-500">System Role:</span>
                <span className="font-medium text-gray-900">{formData.role || '—'}</span>
              </div>
            </div>

          </div>
        )}
        </div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 px-6 pb-6 pt-4 border-t border-gray-100">
          {step === 1 && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={handleNextStep1}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={handleNextStep2}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={createEmployeeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                type="button"
                disabled={
                  !formData.salary ||
                  Number(formData.salary) <= 0 ||
                  !formData.password ||
                  formData.password.length < 8 ||
                  !formData.confirmPassword ||
                  formData.password !== formData.confirmPassword ||
                  createEmployeeMutation.isPending
                }
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[150px]"
              >
                {createEmployeeMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
                {createEmployeeMutation.isPending ? 'Adding Employee...' : 'Add Employee'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddEmployeeModal;
