import { useState, useEffect, useRef, useCallback } from 'react';
import { useCreateEmployee } from '../hooks/useEmployees';
import { checkEmailAvailable } from '../services/apiService';
import { showSuccess } from '../utils/toast';
import useFocusTrap from '../hooks/useFocusTrap';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  department: string;
  jobTitle: string;
  employmentType: string;
  reportingManager: string;
  startDate: string;
  basicSalary: string;
  allowances: string;
  userRole: string;
  tempPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  department?: string;
  jobTitle?: string;
  employmentType?: string;
  reportingManager?: string;
  startDate?: string;
  basicSalary?: string;
  allowances?: string;
  userRole?: string;
  tempPassword?: string;
  confirmPassword?: string;
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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const DEPARTMENT_OPTIONS = ['Engineering', 'Design', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'] as const;
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Intern'] as const;

const FORM_SESSION_KEY = 'hrms_add_employee_form';

const initialFormState: FormData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  department: '',
  jobTitle: '',
  employmentType: '',
  reportingManager: '',
  startDate: '',
  basicSalary: '',
  allowances: '0',
  userRole: 'Employee',
  tempPassword: '',
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

function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const createEmployeeMutation = useCreateEmployee();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email availability
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dirty tracking
  const [isDirty, setIsDirty] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Session restore
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // Auto-focus refs per step
  const step1Ref = useRef<HTMLInputElement>(null);
  const step2Ref = useRef<HTMLSelectElement>(null);
  const step3Ref = useRef<HTMLInputElement>(null);

  // On mount, check for saved form data
  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem(FORM_SESSION_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Auto-focus on step change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (step === 1) step1Ref.current?.focus();
      else if (step === 2) step2Ref.current?.focus();
      else if (step === 3) step3Ref.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  // Email availability debounce check
  useEffect(() => {
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // Save form data to sessionStorage on changes
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
    const trimmedName = formData.fullName.trim();

    if (!trimmedName) {
      newErrors.fullName = 'Full name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (formData.phone && !/^\d*$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.department) {
      newErrors.department = 'Department is required.';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required.';
    }

    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment type is required.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    } else if (formData.startDate < getTodayString()) {
      newErrors.startDate = 'Start date cannot be in the past.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.basicSalary || Number(formData.basicSalary) <= 0) {
      newErrors.basicSalary = 'Basic salary must be a positive number.';
    }

    if (formData.allowances && Number(formData.allowances) < 0) {
      newErrors.allowances = 'Allowances cannot be negative.';
    }

    if (!formData.tempPassword) {
      newErrors.tempPassword = 'Temporary password is required.';
    } else if (formData.tempPassword.length < 8) {
      newErrors.tempPassword = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password.';
    } else if (formData.tempPassword !== formData.confirmPassword) {
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

    const fieldToBackend: Record<string, string> = {
      fullName: 'name',
      jobTitle: 'role',
      startDate: 'startDate',
      department: 'department',
      employmentType: 'employmentType',
      basicSalary: 'basicSalary',
      allowances: 'allowances',
      tempPassword: 'password',
      email: 'email',
      phone: 'phone',
      userRole: 'systemRole',
    };

    try {
      await createEmployeeMutation.mutateAsync({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        department: formData.department,
        role: formData.jobTitle.trim(),
        employmentType: formData.employmentType,
        startDate: formData.startDate,
        basicSalary: Number(formData.basicSalary),
        allowances: Number(formData.allowances) || 0,
        systemRole: formData.userRole === 'HR Manager' ? 'hr_manager' : 'employee',
        password: formData.tempPassword,
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
          const frontendField = Object.entries(fieldToBackend).find(
            ([, backend]) => backend === fe.field,
          )?.[0];
          if (frontendField && frontendField in newErrors) {
            newErrors[frontendField as keyof FormErrors] = fe.message;
          } else if (frontendField) {
            newErrors[frontendField as keyof FormErrors] = fe.message;
          }
        }
        setErrors(newErrors);

        if (newErrors.email) setStep(1);
        else if (newErrors.department || newErrors.jobTitle || newErrors.employmentType || newErrors.startDate) setStep(2);
        return;
      }

      setApiError(error.message || 'Failed to add employee');
    }
  };

  const handleClose = () => {
    if (createEmployeeMutation.isPending) return;

    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      sessionStorage.removeItem(FORM_SESSION_KEY);
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
    formData.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) &&
    emailStatus !== 'unavailable' &&
    emailStatus !== 'checking';

  const isStep2Valid =
    formData.department !== '' &&
    formData.jobTitle.trim().length > 0 &&
    formData.employmentType !== '' &&
    formData.startDate !== '' &&
    formData.startDate >= getTodayString();

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
      <div ref={focusTrapRef} role="dialog" className="relative w-full max-w-[520px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
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

        {renderStepIndicator()}

        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 flex items-start gap-2">
            <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                ref={step1Ref}
                type="text"
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.fullName
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
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
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) {
                      updateField('phone', e.target.value);
                    }
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.phone
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
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

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
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
          </div>
        )}

        {/* Step 2: Department and Role */}
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
              <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-1">
                Job Title / Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                placeholder="Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.jobTitle
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.jobTitle && <p className="text-xs text-red-600 mt-1">{errors.jobTitle}</p>}
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-semibold text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                id="employmentType"
                value={formData.employmentType}
                onChange={(e) => updateField('employmentType', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 ${
                  errors.employmentType
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              >
                <option value="">Select type</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.employmentType && <p className="text-xs text-red-600 mt-1">{errors.employmentType}</p>}
            </div>

            <div>
              <label htmlFor="reportingManager" className="block text-sm font-semibold text-gray-700 mb-1">
                Reporting Manager
              </label>
              <input
                type="text"
                id="reportingManager"
                placeholder="Manager name"
                value={formData.reportingManager}
                onChange={(e) => updateField('reportingManager', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                min={getTodayString()}
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 [color-scheme:light] ${
                  errors.startDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 mt-6">
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
          </div>
        )}

        {/* Step 3: Salary and System Access */}
        {step === 3 && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Compensation Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="basicSalary" className="block text-sm font-semibold text-gray-700 mb-1">
                  Basic Salary (Monthly) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    ref={step3Ref}
                    type="number"
                    id="basicSalary"
                    placeholder="50000"
                    min={1}
                    value={formData.basicSalary}
                    onChange={(e) => updateField('basicSalary', e.target.value)}
                    className={`w-full rounded-lg border pl-8 pr-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                      errors.basicSalary
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                </div>
                {errors.basicSalary && <p className="text-xs text-red-600 mt-1">{errors.basicSalary}</p>}
                {formData.basicSalary && Number(formData.basicSalary) >= 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Annual CTC: ₹{formatIndianCurrency(Number(formData.basicSalary) * 12)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="allowances" className="block text-sm font-semibold text-gray-700 mb-1">
                  Monthly Allowances
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    id="allowances"
                    placeholder="8000"
                    min={0}
                    value={formData.allowances}
                    onChange={(e) => updateField('allowances', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                {errors.allowances && <p className="text-xs text-red-600 mt-1">{errors.allowances}</p>}
              </div>
            </div>

            {/* Net Salary Preview Card */}
            {(formData.basicSalary && Number(formData.basicSalary) >= 1) && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-1.5">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Net Salary Preview</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Basic (Monthly):</span>
                  <span className="font-semibold text-gray-900">₹{formatIndianCurrency(Number(formData.basicSalary))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-semibold text-gray-900">₹{formatIndianCurrency(Number(formData.allowances) || 0)}</span>
                </div>
                <hr className="border-emerald-200 my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-800">Total Monthly:</span>
                  <span className="text-gray-900">₹{formatIndianCurrency(Number(formData.basicSalary) + (Number(formData.allowances) || 0))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-800">Annual CTC:</span>
                  <span className="text-blue-700">₹{formatIndianCurrency((Number(formData.basicSalary) + (Number(formData.allowances) || 0)) * 12)}</span>
                </div>
              </div>
            )}

            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide pt-2">System Access</h4>

            {/* Role Radio Cards */}
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">
                System Role <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField('userRole', 'Employee')}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                    formData.userRole === 'Employee'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Employee</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      Can view dashboard, apply for leave, and download payslips
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField('userRole', 'HR Manager')}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                    formData.userRole === 'HR Manager'
                      ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">👥</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">HR Manager</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      Full access to manage employees, approve leaves, and run payroll
                    </p>
                  </div>
                </button>
              </div>
              {errors.userRole && <p className="text-xs text-red-600 mt-1">{errors.userRole}</p>}
            </div>

            {/* Temporary Password */}
            <div>
              <label htmlFor="tempPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="tempPassword"
                  placeholder="Min 8 characters"
                  value={formData.tempPassword}
                  onChange={(e) => updateField('tempPassword', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                    errors.tempPassword
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
              {formData.tempPassword && (
                <div className="mt-1.5">
                  <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getPasswordStrength(formData.tempPassword).barColor} ${getPasswordStrength(formData.tempPassword).barWidth}`} />
                  </div>
                  <p className={`text-xs font-medium mt-0.5 ${getPasswordStrength(formData.tempPassword).textColor}`}>
                    {getPasswordStrength(formData.tempPassword).label}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">User will change this on first login.</p>
              {errors.tempPassword && <p className="text-xs text-red-600 mt-1">{errors.tempPassword}</p>}
            </div>

            {/* Confirm Password */}
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
                {formData.confirmPassword && formData.tempPassword === formData.confirmPassword && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {formData.confirmPassword && formData.tempPassword !== formData.confirmPassword && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-red-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Review Summary */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-1.5">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Review Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium text-gray-900 truncate">{formData.fullName || '—'}</span>
                <span className="text-gray-500">Email:</span>
                <span className="font-medium text-gray-900 truncate">{formData.email || '—'}</span>
                <span className="text-gray-500">Department:</span>
                <span className="font-medium text-gray-900">{formData.department || '—'}</span>
                <span className="text-gray-500">Role:</span>
                <span className="font-medium text-gray-900 truncate">{formData.jobTitle || '—'}</span>
                <span className="text-gray-500">Salary:</span>
                <span className="font-medium text-gray-900">
                  {formData.basicSalary ? `₹${formatIndianCurrency(Number(formData.basicSalary))}/mo` : '—'}
                </span>
                <span className="text-gray-500">System Role:</span>
                <span className="font-medium text-gray-900">{formData.userRole || '—'}</span>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-4 border-t border-gray-100 mt-6">
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
                  !formData.basicSalary ||
                  Number(formData.basicSalary) <= 0 ||
                  !formData.tempPassword ||
                  formData.tempPassword.length < 8 ||
                  !formData.confirmPassword ||
                  formData.tempPassword !== formData.confirmPassword ||
                  createEmployeeMutation.isPending
                }
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[150px]"
              >
                {createEmployeeMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
                {createEmployeeMutation.isPending ? 'Adding Employee...' : 'Add Employee'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddEmployeeModal;
