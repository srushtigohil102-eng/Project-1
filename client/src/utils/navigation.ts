type NavigateFn = (to: string) => void;

let navigateFn: NavigateFn | null = null;

export function setNavigate(fn: NavigateFn): void {
  navigateFn = fn;
}

export function navigateTo(path: string): void {
  if (navigateFn) {
    navigateFn(path);
    return;
  }

  window.location.href = path;
}
