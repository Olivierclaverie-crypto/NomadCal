import { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((opts) => setToast(opts), []);
  const hideToast = useCallback(() => setToast(null), []);

  // Pont global : permet à du code hors-React (pushEvent) de déclencher un toast
  if (typeof window !== "undefined") {
    window.__showToast = showToast;
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && <Toast {...toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {}, hideToast: () => {} };
  return ctx;
}
