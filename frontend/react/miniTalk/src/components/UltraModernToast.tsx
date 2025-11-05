// Toast system has been removed from the application
// This file is disabled

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}



export const Toast = () => null;
export const ToastContainer = () => null;