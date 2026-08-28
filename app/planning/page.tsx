"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import type { Call, Technician } from "../../lib/types";

const AUCUN_TECHNICIEN = "__non_assigne__";

export default function PlanningPage() {
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [dateSelectionnee, setDateSelectionnee] = useState(
    formatDateInput(new Date())
  );
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [interventionEnGlissement, setInterventionEnGlissement] =
    useState<string | null>(null);
  const [colonneSurvolee, setColonneSurvolee] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    async function verifierAccesEtCharger() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const email = user.email?.toLowerCase().trim();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      const role = profile?.role || "technicien";

      if (role !== "admin") {
        window.location.href = "/";
        return;
      }

      await chargerTechniciens();
    }

    verifierAccesEtCharger();
  }, []);

  useEffect(() => {
    chargerInterventionsDuJour();
  }, [dateSelectionnee]);

  async function chargerTechniciens() {
    const { data, error } = await supabase
      .from("technicians")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Erreur chargement techniciens :", error);
      setErreur(error.message);
      setLoading(false);
      return;
    }

    setTechnicians((data as Technician[]) || []);
  }

  async function chargerInterventionsDuJour() {
    setLoading(true);
    setErreur("");

    const debutJournee = new Date(`${dateSelectionnee}T00:00:00`);
    const finJournee = new Date(`${dateSelectionnee}T23:59:59`);

    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .gte("intervention_date", debutJournee.toISOString())
      .lte("intervention_date", finJournee.toISOString())
      .order("intervention_date", { ascending: true });

    if (error) {
      console.error("Erreur chargement planning :", error);
      setErreur(error.message);
      setLoading(false);
      return;
    }

    setCalls((data as Call[]) || []);
    setLoading(false);
  }

  async function reassignerTechnicien(
    callId: string,
    nomTechnicien: string | null
  ) {
    setEnregistrement(true);

    // Mise à jour optimiste : on met à jour l'affichage tout de suite,
    // avant même la réponse de Supabase.
    setCalls((current) =>
      current.map((call) =>
        call.id === callId
          ? { ...call, technician: nomTechnicien }
          : call
      )
    );

    const { error } = await supabase
      .from("calls")
      .update({ technician: nomTechnicien })
      .eq("id", callId);

    if (error) {
      console.error("Erreur réassignation :", error);
      setErreur(error.message);
      // En cas d'échec, on recharge pour annuler la mise à jour optimiste
      await chargerInterventionsDuJour();
    }

    setEnregistrement(false);
  }

  function changerJour(delta: number) {
    const date = new Date(`${dateSelectionnee}T00:00:00`);
    date.setDate(date.getDate() + delta);
    setDateSelectionnee(formatDateInput(date));
  }

  function estAssigne(call: Call, nomTechnicien: string) {
    return call.technician === nomTechnicien;
  }

  function nonAssigne(call: Call) {
    return !call.technician || call.technician === "vide";
  }

  const colonnes: { cle: string; titre: string; technicien: string | null }[] =
    [
      ...technicians.map((tech) => ({
        cle: tech.id,
        titre: tech.name,
        technicien: tech.name,
      })),
      {
        cle: AUCUN_TECHNICIEN,
        titre: "Non assigné",
        technicien: null,
      },
    ];

  if (loading && technicians.length === 0) {
    return (
      <MainLayout>
        <p>Chargement du planning...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>
              🗓️ Planning technicien
            </h1>

            <p style={{ marginTop: "8px", color: "#64748b" }}>
              Faites glisser une intervention d'une colonne à l'autre pour la
              réassigner.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => changerJour(-1)}
              style={boutonNav}
            >
              ← Veille
            </button>

            <input
              type="date"
              value={dateSelectionnee}
              onChange={(event) =>
                setDateSelectionnee(event.target.value)
              }
              style={{
                padding: "10px 12px",
                borderRadius: "9px",
                border: "1px solid #cbd5e1",
                fontWeight: 700,
              }}
            />

            <button
              type="button"
              onClick={() => changerJour(1)}
              style={boutonNav}
            >
              Lendemain →
            </button>

            <button
              type="button"
              onClick={() =>
                setDateSelectionnee(formatDateInput(new Date()))
              }
              style={{ ...boutonNav, background: "#2563eb", color: "white" }}
            >
              Aujourd'hui
            </button>
          </div>
        </div>

        {erreur && (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {erreur}
          </div>
        )}

        {technicians.length === 0 ? (
          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Aucun technicien actif. Ajoutez des techniciens dans la page
            "Techniciens" pour utiliser le planning.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              paddingBottom: "12px",
            }}
          >
            {colonnes.map((colonne) => {
              const interventionsColonne = calls.filter((call) =>
                colonne.technicien === null
                  ? nonAssigne(call)
                  : estAssigne(call, colonne.technicien)
              );

              const survolee = colonneSurvolee === colonne.cle;

              return (
                <div
                  key={colonne.cle}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setColonneSurvolee(colonne.cle);
                  }}
                  onDragLeave={() => {
                    setColonneSurvolee((current) =>
                      current === colonne.cle ? null : current
                    );
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setColonneSurvolee(null);

                    if (!interventionEnGlissement) return;

                    reassignerTechnicien(
                      interventionEnGlissement,
                      colonne.technicien
                    );

                    setInterventionEnGlissement(null);
                  }}
                  style={{
                    minWidth: "280px",
                    width: "280px",
                    flexShrink: 0,
                    background: survolee ? "#eff6ff" : "#f8fafc",
                    border: survolee
                      ? "2px dashed #2563eb"
                      : "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "14px",
                    minHeight: "200px",
                    transition: "background 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <strong style={{ color: "#0f172a" }}>
                      {colonne.technicien ? `👷 ${colonne.titre}` : "❔ Non assigné"}
                    </strong>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        fontWeight: 700,
                      }}
                    >
                      {interventionsColonne.length}
                    </span>
                  </div>

                  {interventionsColonne.length === 0 ? (
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "13px",
                        textAlign: "center",
                        padding: "20px 0",
                      }}
                    >
                      Aucune intervention
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gap: "8px",
                      }}
                    >
                      {interventionsColonne.map((call) => (
                        <div
                          key={call.id}
                          draggable
                          onDragStart={() =>
                            setInterventionEnGlissement(call.id)
                          }
                          onDragEnd={() =>
                            setInterventionEnGlissement(null)
                          }
                          style={{
                            padding: "12px",
                            borderRadius: "10px",
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderLeft: `4px solid ${couleurUrgence(
                              call.urgency
                            )}`,
                            cursor: "grab",
                            opacity:
                              interventionEnGlissement === call.id
                                ? 0.4
                                : 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              fontWeight: 700,
                              marginBottom: "4px",
                            }}
                          >
                            {formatHeure(call.intervention_date)}
                          </div>

                          <strong
                            style={{
                              display: "block",
                              color: "#0f172a",
                              fontSize: "14px",
                              marginBottom: "4px",
                            }}
                          >
                            {call.client_name || "Client non renseigné"}
                          </strong>

                          <p
                            style={{
                              margin: 0,
                              color: "#64748b",
                              fontSize: "13px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {call.problem || "-"}
                          </p>

                          <Link
                            href={`/interventions/${call.id}`}
                            style={{
                              display: "inline-block",
                              marginTop: "8px",
                              fontSize: "12px",
                              color: "#2563eb",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            Voir →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {enregistrement && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "#0f172a",
              color: "white",
              fontWeight: 700,
              boxShadow: "0 10px 30px rgba(15,23,42,0.25)",
            }}
          >
            Enregistrement...
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function couleurUrgence(urgency: Call["urgency"]) {
  if (urgency === "urgent") return "#dc2626";
  if (urgency === "important") return "#f59e0b";
  return "#16a34a";
}

function formatHeure(value: string | null) {
  if (!value) return "Heure non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateInput(date: Date) {
  const annee = date.getFullYear();
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${annee}-${mois}-${jour}`;
}

const boutonNav: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "9px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};