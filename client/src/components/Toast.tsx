import { useState, useEffect } from "react";

interface ToastProps {
  message?: string;
  duration?: number;
}

export default function Toast({ message = "", duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(message);

  // Global event listener for showing toast messages
  useEffect(() => {
    const showToast = (event: CustomEvent<{ message: string; duration?: number }>) => {
      setToastMessage(event.detail.message);
      setIsVisible(true);

      // Auto-hide the toast after duration
      setTimeout(() => {
        setIsVisible(false);
      }, event.detail.duration || duration);
    };

    // Add event listener
    document.addEventListener('showToast' as any, showToast as any);

    // Cleanup
    return () => {
      document.removeEventListener('showToast' as any, showToast as any);
    };
  }, [duration]);

  // Handle initial message if provided
  useEffect(() => {
    if (message) {
      setToastMessage(message);
      setIsVisible(true);

      // Auto-hide the toast after duration
      setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
  }, [message, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#34A853] text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between w-80 max-w-xs z-50 transition-opacity duration-300">
      <div className="flex items-center">
        <span className="material-icons mr-2">check_circle</span>
        <span>{toastMessage}</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="ml-2 text-white"
      >
        <span className="material-icons">close</span>
      </button>
    </div>
  );
}

// Helper function to show toast from anywhere
export const showToast = (message: string, duration = 3000) => {
  const event = new CustomEvent('showToast', {
    detail: {
      message,
      duration
    }
  });
  
  document.dispatchEvent(event as any);
};
