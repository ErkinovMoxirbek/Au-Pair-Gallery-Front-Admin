// src/components/shared/Toast.js
import { useEffect, useState } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function Toast({
  open,
  type = "info",
  message,
  duration = 5000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(false);

  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-emerald-50",
      border: "border-emerald-500",
      text: "text-emerald-800",
      iconColor: "text-emerald-600",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-rose-50",
      border: "border-rose-500",
      text: "text-rose-800",
      iconColor: "text-rose-600",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-50",
      border: "border-amber-500",
      text: "text-amber-800",
      iconColor: "text-amber-600",
    },
    info: {
      icon: Info,
      bg: "bg-indigo-50",
      border: "border-indigo-500",
      text: "text-indigo-800",
      iconColor: "text-indigo-600",
    },
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!open && !isVisible) return null;

  const title =
    type === "error"
      ? "Fehler"
      : type === "success"
      ? "Erfolg"
      : type === "warning"
      ? "Warnung"
      : "Info";

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <div
        className={`
          pointer-events-auto 
          relative overflow-hidden
          flex items-start gap-3 p-4 
          bg-white 
          border border-gray-100 
          rounded-xl shadow-2xl shadow-gray-200/50
          transition-all duration-500 ease-in-out
          ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bg} ${style.border} border-l-4`} />

        <div className={`flex-shrink-0 mt-0.5 ${style.iconColor}`}>
          <Icon className="w-5 h-5" strokeWidth={2.5} />
        </div>

        <div className="flex-1 mr-2">
          <h4 className={`text-sm font-bold ${style.text} mb-0.5`}>{title}</h4>
          <p className="text-sm text-gray-600 font-medium leading-tight">
            {message}
          </p>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute bottom-0 left-0 h-0.5 bg-gray-100 w-full">
          <div
            className="h-full bg-gray-400/30"
            style={{
              width: isVisible ? "0%" : "100%",
              transition: `width ${duration}ms linear`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
