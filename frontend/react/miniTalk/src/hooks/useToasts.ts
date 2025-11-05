// Toast system has been removed from the application
// This hook is disabled

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string, duration?: number) => 
    addToast('success', title, message, duration);
  
  const showInfo = (title: string, message?: string, duration?: number) => 
    addToast('info', title, message, duration);
  
  const showWarning = (title: string, message?: string, duration?: number) => 
    addToast('warning', title, message, duration);
  
  const showError = (title: string, message?: string, duration?: number) => 
    addToast('error', title, message, duration);

  return {
    toasts,
    removeToast,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  };
}

export type { Toast };