import toast from 'react-hot-toast';

/**
 * Show a success toast notification
 * @param message - The message to display
 */
export const profileSuccess = (message: string): void => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
  });
};

/**
 * Show an error toast notification
 * @param message - The message to display
 */
export const profileError  = (message: string): void => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
};

/**
 * Show an info toast notification
 * @param message - The message to display
 */
export const profileInfo = (message: string): void => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
  });
};

/**
 * Show a loading toast notification
 * @param message - The message to display
 * @returns The toast ID that can be used to dismiss it
 */
export const profileLoading = (message: string): string => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * Dismiss a specific toast by ID
 * @param toastId - The ID of the toast to dismiss
 */
export const profileDismiss = (toastId: string): void => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all currently active toasts
 */
export const profileDismissAll = (): void => {
  toast.dismiss();
};