"use client";

import Card from "../ui/Card";

type InterventionProgressCardProps = {
  status: string | null;
};

const steps = [
  {
    status: "nouveau",
    label: "Appel reçu",
    icon: "📞",
  },
  {
    status: "planifie",
    label: "Planifié",
    icon: "📅",
  },
  {
    status: "en_route",
    label: "En route",
    icon: "🚗",
  },
  {
    status: "arrived",
    label: "Arrivé",
    icon: "📍",
  },
  {
    status: "in_progress",
    label: "Intervention",
    icon: "🔧",
  },
  {
    status: "termine",
    label: "Terminée",
    icon: "✅",
  },
];

export default function InterventionProgressCard({
  status,
}: InterventionProgressCardProps) {
  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>Progression de l’intervention</h3>

      <div style={{ display: "grid", gap: "12px" }}>
        {steps.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;
          const isUpcoming = currentIndex < index;

          return (
            <div
              key={step.status}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                opacity: isUpcoming ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  minWidth: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCompleted
                    ? "#dcfce7"
                    : isCurrent
                      ? "#dbeafe"
                      : "#f1f5f9",
                  border: isCurrent
                    ? "2px solid #2563eb"
                    : "1px solid #cbd5e1",
                }}
              >
                {isCompleted ? "✓" : step.icon}
              </div>

              <div>
                <strong>{step.label}</strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {isCompleted
                    ? "Étape terminée"
                    : isCurrent
                      ? "Étape actuelle"
                      : "À venir"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}