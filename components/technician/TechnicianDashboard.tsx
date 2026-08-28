"use client";

import Link from "next/link";

type TechnicianDashboardProps = {
  calls: any[];
  technicianName: string;
};

export default function TechnicianDashboard({
  calls,
  technicianName,
}: TechnicianDashboardProps) {
  const interventions = [...calls].sort((a, b) => {
    const dateA = a.intervention_date
      ? new Date(a.intervention_date).getTime()
      : Number.MAX_SAFE_INTEGER;

    const dateB = b.intervention_date
      ? new Date(b.intervention_date).getTime()
      : Number.MAX_SAFE_INTEGER;

    return dateA - dateB;
  });

  function afficherDate(date: string | null) {
    if (!date) return "Non planifiée";

    return new Date(date).toLocaleString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statutLisible(status: string) {
    switch (status) {
      case "en_route":
        return "🚗 En route";

      case "arrived":
        return "📍 Arrivé";

      case "in_progress":
        return "🔧 En intervention";

      case "termine":
      case "completed":
        return "✅ Terminée";

      case "planifie":
      case "scheduled":
        return "📅 Planifiée";

      default:
        return "📋 À faire";
    }
  }

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        paddingBottom: "40px",
      }}
    >
      <div
        style={{
          marginBottom: "26px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "32px",
            color: "#0f172a",
          }}
        >
          👷 Bonjour {technicianName || "Technicien"}
        </h1>

        <p
          style={{
            marginTop: "7px",
            color: "#64748b",
          }}
        >
          Voici vos interventions attribuées.
        </p>
      </div>

      {interventions.length === 0 ? (
        <div
          style={{
            padding: "40px",
            borderRadius: "18px",
            background: "white",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "38px" }}>✅</div>

          <h2>Aucune intervention</h2>

          <p style={{ color: "#64748b" }}>
            Vous n'avez aucune mission attribuée pour le moment.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {interventions.map((call) => (
            <section
              key={call.id}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "22px",
                boxShadow:
                  "0 8px 24px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: 800,
                      marginBottom: "6px",
                    }}
                  >
                    {call.intervention_number ||
                      "INTERVENTION"}
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: "#0f172a",
                    }}
                  >
                    {call.client_name || "Client"}
                  </h2>

                  <div
                    style={{
                      marginTop: "8px",
                      color: "#475569",
                    }}
                  >
                    📅 {afficherDate(call.intervention_date)}
                  </div>
                </div>

                <strong
                  style={{
                    padding: "8px 11px",
                    borderRadius: "999px",
                    background: "#f1f5f9",
                    color: "#334155",
                    fontSize: "13px",
                  }}
                >
                  {statutLisible(call.status)}
                </strong>
              </div>

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gap: "10px",
                }}
              >
                {call.address && (
                  <div>
                    📍 <strong>{call.address}</strong>
                  </div>
                )}

                {call.problem && (
                  <div>
                    🛠️ {call.problem}
                  </div>
                )}

                {call.required_skill && (
                  <div>
                    👷 Compétence :{" "}
                    <strong>{call.required_skill}</strong>
                  </div>
                )}
              </div>

              {Array.isArray(call.recommended_materials) &&
                call.recommended_materials.length > 0 && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px",
                      background: "#eff6ff",
                      borderRadius: "12px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "9px",
                        color: "#1e40af",
                      }}
                    >
                      🧰 Matériel à prévoir
                    </strong>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "7px",
                      }}
                    >
                      {call.recommended_materials.map(
                        (material: string) => (
                          <span
                            key={material}
                            style={{
                              padding: "6px 9px",
                              borderRadius: "999px",
                              background: "white",
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

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                {call.client_phone && (
                  <a
                    href={`tel:${call.client_phone}`}
                    style={secondaryButton}
                  >
                    📞 Appeler
                  </a>
                )}

                {call.address && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      call.address
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={secondaryButton}
                  >
                    🗺️ Itinéraire
                  </a>
                )}

                <Link
                  href={`/interventions/${call.id}`}
                  style={primaryButton}
                >
                  Ouvrir l'intervention →
                </Link>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  padding: "11px 15px",
  borderRadius: "9px",
  background: "#2563eb",
  color: "white",
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  padding: "11px 15px",
  borderRadius: "9px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  textDecoration: "none",
};