import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: 'top-center',
    duration: 4000,
    style: {
      background: '#10B981',
      color: '#fff',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: 'top-center',
    duration: 4000,
    style: {
      background: '#EF4444',
      color: '#fff',
    },
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: 'top-center',
  });
};

export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};