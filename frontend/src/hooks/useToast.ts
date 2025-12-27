import toast, { Toast } from 'react-hot-toast';

export const useToast = () => {
  return {
    // Success toast
    success: (message: string, options?: any) =>
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        ...options,
      }),

    // Error toast
    error: (message: string, options?: any) =>
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        ...options,
      }),

    // Loading toast
    loading: (message: string, options?: any) =>
      toast.loading(message, {
        duration: 99999,
        position: 'top-right',
        ...options,
      }),

    // Info/default toast
    info: (message: string, options?: any) =>
      toast(message, {
        duration: 3000,
        position: 'top-right',
        ...options,
      }),

    // Dismiss a specific toast
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },

    // Promise-based toast with loading, success, error states
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      },
      options?: any
    ) =>
      toast.promise(
        promise,
        {
          loading: messages.loading,
          success: messages.success,
          error: messages.error,
        },
        {
          position: 'top-right',
          ...options,
        }
      ),
  };
};
