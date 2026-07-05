"use client";

type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "18px",
        padding: "20px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px rgba(15,23,42,.08)",
      }}
    >
      {children}
    </div>
  );
}