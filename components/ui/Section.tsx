"use client";

type SectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Section({ title, subtitle, children }: SectionProps) {
  return (
    <section style={{ marginTop: "25px" }}>
      <div style={{ marginBottom: "15px" }}>
        <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>
          {title}
        </h2>

        {subtitle && (
          <p style={{ marginTop: "6px", color: "#64748b" }}>
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}