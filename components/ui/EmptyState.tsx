"use client";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        border: "1px dashed #cbd5e1",
        borderRadius: "16px",
        background: "#f8fafc",
      }}
    >
      <h3 style={{ margin: 0, color: "#0f172a" }}>{title}</h3>

      {description && (
        <p style={{ color: "#64748b", marginTop: "8px" }}>
          {description}
        </p>
      )}
    </div>
  );
}