import { useState, useEffect } from 'react';
import { useUpdateEmployee } from '../hooks/useEmployees';
import type { Employee, UpdateEmployeeData } from '../services/apiService';
import { showSuccess, showError } from '../utils/toast';
import useFocusTrap from '../hooks/useFocusTrap';

interface EditEmployeeModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DEPARTMENT_OPTIONS = ['Engineering', 'Design', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'] as const;
const STATUS_OPTIONS = ['Active', 'On Leave', 'Inactive'] as const;

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

function EditEmployeeModal({ isOpen, employee, onClose, onSuccess }: EditEmployeeModalProps) {
  const updateMutation = useUpdateEmployee();

  const [formData, setFormData] = useState<UpdateEmployeeData>({});
  const [originalData, setOriginalData] = useState<UpdateEmployeeData>({});

  useEffect(() => {
    if (employee && isOpen) {
      const data: UpdateEmployeeData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phoneNumber,
        designation: employee.designation,
        department: employee.department.name,
        salary: employee.salary,
        status: employee.status,
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [employee, isOpen]);

  const updateField = (field: keyof UpdateEmployeeData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!employee) return;

    const changedFields: UpdateEmployeeData = {};
    for (const key of Object.keys(formData) as (keyof UpdateEmployeeData)[]) {
      if (formData[key] !== originalData[key]) {
        changedFields[key] = formData[key] as any;
      }
    }

    if (Object.keys(changedFields).length === 0) {
      showError('No changes made');
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: employee.id, data: changedFields });
      showSuccess(`${employee.fullName} has been updated`);
      onClose();
      onSuccess();
    } catch (err) {
      showError(`Failed to update: ${(err as Error).message}`);
    }
  };

  const focusTrapRef = useFocusTrap(isOpen);

  if (!isOpen || !employee) return null;

  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={onClose} />
      <div ref={focusTrapRef} role="dialog" className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Edit Employee</h3>
          <button type="button" aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors" onClick={onClose}>
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-gray-500 font-medium">Editing: <span className="text-gray-900">{employee.fullName}</span></p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
              <input type="text" value={formData.firstName || ''} onChange={(e) => updateField('firstName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input type="text" value={formData.lastName || ''} onChange={(e) => updateField('lastName', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input type="tel" value={formData.phoneNumber || ''} onChange={(e) => { if (/^\d*$/.test(e.target.value)) updateField('phoneNumber', e.target.value); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
            <input type="text" value={formData.designation || ''} onChange={(e) => updateField('designation', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <select value={formData.department || ''} onChange={(e) => updateField('department', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20">
              {DEPARTMENT_OPTIONS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Salary (Monthly)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">₹</span>
              <input type="number" min={1} value={formData.salary || ''} onChange={(e) => updateField('salary', Number(e.target.value))} className="w-full rounded-lg border border-gray-300 pl-8 pr-3 py-2 text-sm text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select value={formData.status || 'Active'} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20">
              {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
          <button type="button" onClick={onClose} disabled={updateMutation.isPending} className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={!isDirty || updateMutation.isPending} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {updateMutation.isPending && <SpinnerIcon className="h-4 w-4 animate-spin text-white" />}
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditEmployeeModal;
