import toast from 'react-hot-toast';

/**
 * Show a success toast notification
 * @param message - The message to display
 */
export const toastSuccess = (message: string): void => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
  });
};

/**
 * Show an error toast notification
 * @param message - The message to display
 */
export const toastError = (message: string): void => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
};

/**
 * Show an info toast notification
 * @param message - The message to display
 */
export const toastInfo = (message: string): void => {
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
export const toastLoading = (message: string): string => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * Dismiss a specific toast by ID
 * @param toastId - The ID of the toast to dismiss
 */
export const toastDismiss = (toastId: string): void => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all currently active toasts
 */
export const toastDismissAll = (): void => {
  toast.dismiss();
};