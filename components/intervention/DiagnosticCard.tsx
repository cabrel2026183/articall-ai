"use client";

import type { Call } from "../../lib/types";

type DiagnosticCardProps = {
  call: Call;
};

export default function DiagnosticCard({
  call,
}: DiagnosticCardProps) {
  const materials =
    Array.isArray(call.recommended_materials)
      ? call.recommended_materials
      : [];

  const hasDiagnostic =
    call.problem ||
    call.required_skill ||
    call.workflow_summary ||
    materials.length > 0;

  if (!hasDiagnostic) {
    return null;
  }

  return (
    <section
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          padding: "18px 20px",
          background: "#f8fafc",
          borderBottom:
            "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          🧠
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "18px",
            }}
          >
            Diagnostic & préparation
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Informations préparées lors de
            la prise d’appel.
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {call.problem && (
          <InfoBlock
            label="🔧 Intervention"
            value={call.problem}
          />
        )}

        {call.required_skill && (
          <InfoBlock
            label="👷 Compétence requise"
            value={call.required_skill}
          />
        )}

        {call.workflow_summary && (
          <InfoBlock
            label="📋 Résumé du diagnostic"
            value={call.workflow_summary}
          />
        )}

        {materials.length > 0 && (
          <div style={{ marginTop: "18px" }}>
            <strong
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#475569",
              }}
            >
              🧰 Matériel conseillé
            </strong>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {materials.map(
                (
                  material: string,
                  index: number
                ) => (
                  <span
                    key={`${material}-${index}`}
                    style={{
                      padding: "8px 11px",
                      borderRadius: "999px",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {material}
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {call.urgency && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px 14px",
              borderRadius: "10px",
              background:
                call.urgency === "urgent"
                  ? "#fef2f2"
                  : call.urgency ===
                      "important"
                    ? "#fff7ed"
                    : "#f0fdf4",
              color:
                call.urgency === "urgent"
                  ? "#b91c1c"
                  : call.urgency ===
                      "important"
                    ? "#c2410c"
                    : "#166534",
              fontWeight: 800,
            }}
          >
            ⚠️ Priorité :{" "}
            {call.urgency === "urgent"
              ? "Urgente"
              : call.urgency === "important"
                ? "Importante"
                : "Normale"}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom:
          "1px solid #f1f5f9",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "5px",
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {label}
      </strong>

      <div
        style={{
          color: "#0f172a",
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}