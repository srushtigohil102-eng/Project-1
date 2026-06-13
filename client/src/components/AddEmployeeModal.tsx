import { useState } from 'react';
import { useCreateEmployee } from '../hooks/useEmployees';

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

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
const DEPARTMENT_OPTIONS = ['Engineering', 'Design', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'] as const;
const EMPLOYMENT_TYPES = ['Full Time', 'Part Time', 'Contract', 'Intern'] as const;

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

function AddEmployeeModal({ isOpen, onClose, onSuccess }: AddEmployeeModalProps) {
  const createEmployeeMutation = useCreateEmployee();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // State resets on mount when the parent uses conditional rendering.
  // If the parent keeps the component mounted, the form preserves data across opens.

  const getTodayString = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    try {
      await createEmployeeMutation.mutateAsync({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        department: formData.department,
        role: formData.jobTitle.trim(),
        salary: Number(formData.basicSalary),
        password: formData.tempPassword,
      });

      onClose();
      onSuccess();
    } catch (err) {
      setApiError(`Failed to add employee: ${(err as Error).message || 'Server error'}`);
    }
  };

  const handleClose = () => {
    if (!createEmployeeMutation.isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isStep1Valid =
    formData.fullName.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

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
      <div className="relative w-full max-w-[520px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
          <button
            type="button"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            onClick={handleClose}
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

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
              <input
                type="email"
                id="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
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
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 ${
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="basicSalary" className="block text-sm font-semibold text-gray-700 mb-1">
                  Basic Salary <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    id="basicSalary"
                    placeholder="50000"
                    min={0}
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
              </div>

              <div>
                <label htmlFor="allowances" className="block text-sm font-semibold text-gray-700 mb-1">
                  Allowances
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    id="allowances"
                    placeholder="0"
                    min={0}
                    value={formData.allowances}
                    onChange={(e) => updateField('allowances', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                {errors.allowances && <p className="text-xs text-red-600 mt-1">{errors.allowances}</p>}
              </div>
            </div>

            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-2">
                User Role in System <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userRole"
                    value="Employee"
                    checked={formData.userRole === 'Employee'}
                    onChange={(e) => updateField('userRole', e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 font-medium">Employee</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userRole"
                    value="HR Manager"
                    checked={formData.userRole === 'HR Manager'}
                    onChange={(e) => updateField('userRole', e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800 font-medium">HR Manager</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="tempPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="tempPassword"
                placeholder="Min 8 characters"
                value={formData.tempPassword}
                onChange={(e) => updateField('tempPassword', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.tempPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1">User will change this on first login.</p>
              {errors.tempPassword && <p className="text-xs text-red-600 mt-1">{errors.tempPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="confirmPassword"
                placeholder="Re-enter the password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
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
                  createEmployeeMutation.isPending
                }
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[140px]"
              >
                {createEmployeeMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
                {createEmployeeMutation.isPending ? 'Adding Employee...' : 'Submit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddEmployeeModal;
