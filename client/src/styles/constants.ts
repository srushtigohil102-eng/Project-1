export const PAGE = {
  heading: 'text-2xl font-bold text-gray-900',
  subtext: 'mt-1 text-sm text-gray-500',
  sectionGap: 'mb-6',
  wrapper: 'space-y-6',
} as const;

export const CARD = {
  container: 'rounded-xl border border-gray-200 bg-white shadow-xs',
  containerHover: 'rounded-xl border border-gray-200 bg-white shadow-xs hover:shadow-sm transition-shadow',
  stat: 'rounded-xl border border-gray-100 bg-white p-5 shadow-sm',
  table: 'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs',
  p4: 'p-4',
  p5: 'p-5',
  p6: 'p-6',
} as const;

export const BUTTON = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  success:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  danger:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  secondary:
    'rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  tableAction:
    'rounded-md px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
  icon: 'rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors cursor-pointer',
} as const;

export const TABLE = {
  wrapper: 'overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs',
  table: 'w-full text-sm',
  thead: 'bg-gray-50',
  th: 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
  td: 'px-4 py-4 text-sm text-gray-600',
  tdRight: 'px-4 py-4 text-sm text-gray-600 text-right',
  tr: 'border-b border-gray-100 transition-colors hover:bg-gray-50',
} as const;

export const INPUT = {
  base: 'w-full rounded-lg border px-3 py-2 text-sm text-gray-950 placeholder-gray-400 focus:outline-hidden focus:ring-2',
  border: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20',
  borderError: 'border-red-300 focus:border-red-500 focus:ring-red-500/20',
  borderSuccess: 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20',
  label: 'block text-sm font-semibold text-gray-700 mb-1',
  errorText: 'text-xs text-red-600 mt-1',
  helperText: 'text-xs text-gray-400 mt-1',
  select: 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white text-gray-950 focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20',
} as const;

export const MODAL = {
  overlay: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  backdrop: 'absolute inset-0 bg-gray-900/50 backdrop-blur-xs',
  container: 'relative w-full max-w-[480px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all',
  header: 'flex items-center justify-between pb-4 border-b border-gray-100',
  title: 'text-lg font-bold text-gray-900',
  footer: 'flex gap-3 pt-4 border-t border-gray-100 mt-6',
  confirmContainer: 'relative w-full max-w-[380px] transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-150 transition-all',
} as const;

export const BADGE = {
  base: 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-500',
  dot: (color: string) => `h-1.5 w-1.5 rounded-full ${color}`,
} as const;

export const SKELETON = {
  block: 'animate-pulse rounded bg-gray-200',
  text: 'h-3 rounded bg-gray-200',
  title: 'h-5 w-48 rounded bg-gray-200',
  avatar: 'h-8 w-8 rounded-full bg-gray-200',
  card: 'animate-pulse rounded-xl bg-white p-5 border border-gray-100',
} as const;

export const EMPTY_STATE = {
  wrapper: 'flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-12',
  icon: 'h-10 w-10 text-gray-300 mb-3',
  iconWrapper: 'rounded-full bg-gray-50 p-4 mb-4 text-gray-400',
  heading: 'text-base font-semibold text-gray-900',
  subtext: 'mt-1 text-sm text-gray-500',
} as const;

export const ERROR_STATE = {
  wrapper: 'flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12',
  icon: 'h-10 w-10 text-red-400 mb-3',
  text: 'text-sm font-semibold text-red-700 mb-1',
  subtext: 'text-xs text-red-500 mb-4',
} as const;

export const ALERT = {
  error: 'rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100 flex items-start gap-2',
  warning: 'rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-200 flex items-center justify-between gap-3',
  info: 'rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 border border-blue-100 flex items-start gap-2',
} as const;

export const FOCUS_RING = {
  blue: 'focus:outline-hidden focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20',
  emerald: 'focus:outline-hidden focus:ring-2 focus:border-emerald-500 focus:ring-emerald-500/20',
  red: 'focus:outline-hidden focus:ring-2 focus:border-red-500 focus:ring-red-500/20',
} as const;
