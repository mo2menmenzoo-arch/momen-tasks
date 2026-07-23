let deferredPrompt: any = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export function isInstallable(): boolean {
  return deferredPrompt !== null;
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches;
}

export async function promptInstall(): Promise<string | null> {
  if (!deferredPrompt) return null;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
}
