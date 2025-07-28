// Service Worker registration and management
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, notify user
            if (window.confirm('New content is available. Refresh to update?')) {
              window.location.reload();
            }
          }
        });
      }
    });

    console.log('Service Worker registered successfully');
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('Service Worker unregistered successfully');
    }
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

// Check if app is running in standalone mode (PWA)
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

// Network status monitoring
export const getNetworkStatus = (): 'online' | 'offline' => {
  if (typeof window === 'undefined') return 'online';
  return navigator.onLine ? 'online' : 'offline';
};

export const onNetworkChange = (callback: (status: 'online' | 'offline') => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback('online');
  const handleOffline = () => callback('offline');

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};