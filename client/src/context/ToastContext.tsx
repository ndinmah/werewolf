import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động xóa sau 4 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-[#030303] border-[#84cc16]/50 text-[#d9f99d] shadow-[inset_0_0_15px_rgba(132,204,22,0.2)]';
      case 'error':
        return 'bg-[#030303] border-[#8a0303] text-[#ffdddd] shadow-[inset_0_0_20px_rgba(138,3,3,0.4)]';
      case 'warning':
        return 'bg-[#030303] border-[#aa8c55]/50 text-[#fef3c7] shadow-[inset_0_0_15px_rgba(170,140,85,0.2)]';
      case 'info':
      default:
        return 'bg-[#030303] border-white/20 text-gray-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]';
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-[#84cc16] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-[#8a0303] shrink-0 animate-pulse" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-[#aa8c55] shrink-0" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-gray-400 shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none font-['Cormorant_Garamond',serif]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-4 p-5 rounded-none border backdrop-blur-md transition-all duration-300 transform translate-x-0 animate-fade-in pointer-events-auto ${getToastStyle(
              toast.type,
            )}`}
            role="alert"
          >
            {getToastIcon(toast.type)}
            <div className="grow text-lg font-medium italic tracking-wide">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer mt-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
