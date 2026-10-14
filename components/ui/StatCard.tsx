"use client";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  compact?: boolean;
};

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
  compact = false,
}: StatCardProps) {
  if (compact) {
    return (
      <div
        style={{
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "12px 14px",
          background: "#ffffff",
          boxShadow: "0 4px 14px rgba(15,23,42,.06)",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <span style={{ fontSize: "16px" }}>{icon}</span>
          <span>{title}</span>
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "20px",
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          {value}
        </div>

        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "22px",
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(15,23,42,.08)",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          marginBottom: "10px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#64748b",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "8px 0 0",
          fontSize: "28px",
          color: "#0f172a",
        }}
      >
        {value}
      </h2>

      {subtitle && (
        <p
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}