export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Open login in a popup window so user stays on current page
export function openLoginPopup(onComplete?: () => void) {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  
  const popup = window.open(
    '/api/login',
    'auth-popup',
    `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
  );
  
  const handleMessage = (event: MessageEvent) => {
    if (event.data === 'auth-complete') {
      window.removeEventListener('message', handleMessage);
      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    }
  };
  window.addEventListener('message', handleMessage);
  
  const checkClosed = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkClosed);
      window.removeEventListener('message', handleMessage);
      if (onComplete) {
        onComplete();
      } else {
        window.location.reload();
      }
    }
  }, 500);
}

// Redirect to login with a toast notification (uses popup)
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    openLoginPopup();
  }, 500);
}
