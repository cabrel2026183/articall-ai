"use client";

import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

type ToastProps = {
  open: boolean;
  title: string;
  message?: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
};

export default function Toast({
  open,
  title,
  message,
  type = "info",
  onClose,
}: ToastProps) {
  if (!open) return null;

  const config = {
    success: {
      icon: <CheckCircle size={22} />,
      color: "#16a34a",
    },
    error: {
      icon: <AlertCircle size={22} />,
      color: "#dc2626",
    },
    info: {
      icon: <Info size={22} />,
      color: "#2563eb",
    },
  };

  const current = config[type];

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 3000,
        width: 360,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        borderLeft: `5px solid ${current.color}`,
        padding: 18,
        display: "flex",
        gap: 14,
        animation: "fadeIn .25s ease",
      }}
    >
      <div style={{ color: current.color }}>
        {current.icon}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        {message && (
          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            {message}
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}