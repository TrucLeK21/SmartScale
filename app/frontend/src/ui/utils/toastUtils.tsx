import { toast, ToastOptions } from 'react-toastify';

const defaultToastOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
};

export const showToast = {
    success: (message: string, options?: ToastOptions) =>
        toast.success(message, { ...defaultToastOptions, ...options }),
    error: (message: string, options?: ToastOptions) =>
        toast.error(message, { ...defaultToastOptions, ...options }),
    info: (message: string, options?: ToastOptions) =>
        toast.info(message, { ...defaultToastOptions, ...options }),
    warn: (message: string, options?: ToastOptions) =>
        toast.warn(message, { ...defaultToastOptions, ...options }),
};