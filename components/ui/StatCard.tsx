"use client";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  subtitle,
}: StatCardProps) {
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