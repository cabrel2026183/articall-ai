"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "danger" | "success";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmColor =
    variant === "success" ? "#16a34a" : "#dc2626";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.55)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          borderRadius: "18px",
          background: "#ffffff",
          padding: "24px",
          boxShadow: "0 25px 70px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "21px",
            color: "#0f172a",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            marginTop: "12px",
            lineHeight: 1.6,
            color: "#64748b",
          }}
        >
          {message}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "24px",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "11px 16px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "11px 16px",
              border: "none",
              borderRadius: "10px",
              background: loading ? "#94a3b8" : confirmColor,
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Traitement..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}