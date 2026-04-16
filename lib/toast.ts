import toast from "react-hot-toast";

/**
 * Success Toast
 */
export const showSuccess = (message: string) =>
  toast.success(message, {
    style: {
      borderLeft: "4px solid var(--main-gold)",
    },
  });

/**
 * Error Toast
 */
export const showError = (message: string) =>
  toast.error(message, {
    style: {
      borderLeft: "4px solid #ef4444",
    },
  });

/**
 * Loading Toast
 */
export const showLoading = (message: string) => toast.loading(message);

/**
 * Dismiss Toast
 */
export const dismissToast = (id?: string) => toast.dismiss(id);
