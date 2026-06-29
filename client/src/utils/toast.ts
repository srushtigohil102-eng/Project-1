import toast from 'react-hot-toast';

export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
      fontSize: '14px',
      fontWeight: 600,
    },
    iconTheme: {
      primary: '#059669',
      secondary: '#ecfdf5',
    },
  });
}

export function showError(message: string): void {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      fontSize: '14px',
      fontWeight: 600,
    },
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fef2f2',
    },
  });
}

export function showLoading(message: string): string {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
      fontSize: '14px',
      fontWeight: 600,
    },
  });
}

export function showLoadingSuccess(id: string, message: string): void {
  toast.success(message, {
    id,
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #a7f3d0',
      fontSize: '14px',
      fontWeight: 600,
    },
    iconTheme: {
      primary: '#059669',
      secondary: '#ecfdf5',
    },
  });
}

export function showLoadingError(id: string, message: string): void {
  toast.error(message, {
    id,
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      fontSize: '14px',
      fontWeight: 600,
    },
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fef2f2',
    },
  });
}
