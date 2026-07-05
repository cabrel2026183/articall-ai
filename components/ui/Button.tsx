"use client";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: "#2563eb",
      color: "white",
    },
    secondary: {
      background: "#e2e8f0",
      color: "#0f172a",
    },
    danger: {
      background: "#dc2626",
      color: "white",
    },
    success: {
      background: "#16a34a",
      color: "white",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        border: "none",
        borderRadius: "10px",
        padding: "10px 14px",
        cursor: "pointer",
        fontWeight: "600",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}