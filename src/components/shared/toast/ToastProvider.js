// src/components/shared/toast/ToastProvider.js
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "../Toast";

const ToastContext = createContext(null);

const normalizeType = (t) => {
  const type = String(t || "info").toLowerCase();
  if (type === "success" || type === "error" || type === "warning" || type === "info") return type;
  return "info";
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    type: "info",
    message: "",
    duration: 4500,
  });

  const showToast = useCallback((message, type = "info", options = {}) => {
    const duration = Number(options.duration ?? 4500);

    // ketma-ket chaqirilsa ham animatsiya/refresh bo‘lishi uchun:
    setToast((prev) => ({
      ...prev,
      open: false,
    }));

    requestAnimationFrame(() => {
      setToast({
        open: true,
        type: normalizeType(type),
        message: String(message ?? ""),
        duration: Number.isFinite(duration) ? duration : 4500,
      });
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((p) => ({ ...p, open: false }));
  }, []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast() must be used inside <ToastProvider>.");
  }
  return ctx;
}
