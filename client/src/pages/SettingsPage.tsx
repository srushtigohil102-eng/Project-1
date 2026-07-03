import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { showSuccess, showError } from '../utils/toast';
import ConfirmDialog from '../components/ConfirmDialog';

/* ─────────── Strength indicator ─────────── */

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: 'bg-gray-200', width: 'w-0' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
  if (score <= 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
}

/* ─────────── SectionDivider ─────────── */

function SectionDivider() {
  return <hr className="my-8 border-gray-200" />;
}

/* ─────────── SettingsPage ─────────── */

export default function SettingsPage() {
  const { user } = useAuth();

  /* Section 2 — System toggles */
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [payrollReminders, setPayrollReminders] = useState(true);

  /* Section 3 — Password form */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;

  /* Section 4 — Danger zone */
  const [showDangerDialog, setShowDangerDialog] = useState(false);

  const handleSaveSettings = () => {
    showSuccess('Settings saved successfully');
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all password fields');
      return;
    }
    if (newPassword.length < 8) {
      showError('New password must be at least 8 characters');
      return;
    }
    if (!passwordsMatch) {
      showError('Passwords do not match');
      return;
    }
    showSuccess('Password update coming in next version');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetAllData = () => {
    setShowDangerDialog(false);
    showSuccess('This feature is disabled in demo mode');
  };

  return (
    <div className="space-y-2">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and system preferences</p>
      </div>

      {/* ═══════════ Section 1: Profile ═══════════ */}
      <section className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
        <p className="mb-6 text-sm text-gray-500">Your account information</p>

        <div className="space-y-5">
          <ProfileField label="Name" value={user?.name ?? '—'} />
          <ProfileField label="Email" value={user?.email ?? '—'} />
          <ProfileField label="Role" value={user?.role ?? '—'} />
          <ProfileField label="Employee ID" value="ADMIN2026001" />
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 2: System Configuration ═══════════ */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
        <p className="mb-6 text-sm text-gray-500">Manage system-wide preferences</p>

        <div className="space-y-5">
          <ToggleRow
            label="Email Notifications"
            description="Send email alerts for leave requests"
            checked={emailNotifications}
            onChange={setEmailNotifications}
          />
          <ToggleRow
            label="Auto-approve leaves under 2 days"
            description="Automatically approve leaves of 1-2 days"
            checked={autoApprove}
            onChange={setAutoApprove}
          />
          <ToggleRow
            label="Payroll reminders"
            description="Send monthly payroll processing reminders"
            checked={payrollReminders}
            onChange={setPayrollReminders}
          />
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
        >
          Save Settings
        </button>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 3: Security ═══════════ */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Security</h2>
        <p className="mb-6 text-sm text-gray-500">Manage your password and active sessions</p>

        {/* Change Password */}
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Change Password</h3>
          <div className="grid max-w-md gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-xs font-medium text-gray-600">
                Current Password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-gray-600">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-medium text-gray-600">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Strength</span>
                  <span className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={handleUpdatePassword}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 cursor-pointer"
            >
              Update Password
            </button>
            {!passwordsMatch && confirmPassword && (
              <span className="text-xs font-medium text-red-600">Passwords do not match</span>
            )}
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Active Sessions</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-900">Current browser</td>
                  <td className="px-4 py-3 text-gray-700">Surat, Gujarat</td>
                  <td className="px-4 py-3 text-gray-700">Just now</td>
                  <td className="px-4 py-3 text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ═══════════ Section 4: Danger Zone ═══════════ */}
      <section className="rounded-xl border-2 border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
        <p className="mb-4 text-sm text-red-600">Irreversible actions that affect the entire system</p>

        <button
          type="button"
          onClick={() => setShowDangerDialog(true)}
          className="rounded-lg border-2 border-red-600 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
        >
          Reset All Data
        </button>
      </section>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDangerDialog}
        title="Are you absolutely sure?"
        message="This will delete all employees, leaves, and payroll records. This action cannot be undone."
        confirmText="Reset Everything"
        confirmColor="red"
        onConfirm={handleResetAllData}
        onCancel={() => setShowDangerDialog(false)}
      />
    </div>
  );
}

/* ─────────── ProfileField ─────────── */

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => showSuccess('Profile editing coming soon')}
        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 cursor-pointer"
      >
        Edit
      </button>
    </div>
  );
}

/* ─────────── ToggleRow ─────────── */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
