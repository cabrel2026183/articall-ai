"use client";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
};

export default function Badge({ children, variant = "default" }: BadgeProps) {
  const styles: Record<string, React.CSSProperties> = {
    default: { background: "#e2e8f0", color: "#0f172a" },
    success: { background: "#dcfce7", color: "#166534" },
    warning: { background: "#fef3c7", color: "#92400e" },
    danger: { background: "#fee2e2", color: "#991b1b" },
    info: { background: "#dbeafe", color: "#1e40af" },
  };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}