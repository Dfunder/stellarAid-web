import { useToast } from "@/components/ui";

let toastInstance: ReturnType<typeof useToast> | null = null;

// Initialize toast instance (call this in your app root)
export const initializeToast = (toast: ReturnType<typeof useToast>) => {
  toastInstance = toast;
};

// Helper functions for use outside React components
export const toastSuccess = (message: string, title?: string) => {
  if (toastInstance) {
    toastInstance.success(message, title);
  } else {
    console.log('[TOAST SUCCESS]:', message, title || '');
  }
};

export const toastError = (message: string, title?: string) => {
  if (toastInstance) {
    toastInstance.error(message, title);
  } else {
    console.error('[TOAST ERROR]:', message, title || '');
  }
};

export const toastWarning = (message: string, title?: string) => {
  if (toastInstance) {
    toastInstance.warning(message, title);
  } else {
    console.warn('[TOAST WARNING]:', message, title || '');
  }
};

export const toastInfo = (message: string, title?: string) => {
  if (toastInstance) {
    toastInstance.info(message, title);
  } else {
    console.info('[TOAST INFO]:', message, title || '');
  }
};
