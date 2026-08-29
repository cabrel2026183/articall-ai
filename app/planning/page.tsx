"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import type { Call, Technician } from "../../lib/types";

const START_HOUR = 8;
const END_HOUR = 19;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const CARD_HEIGHT = 50;
const HEURES = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => START_HOUR + i
);
const JOURS_LABELS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

type Vue = "jour" | "semaine";

type ColonneCible = {
  cle: string;
  titre: string;
  technicien: string | null;
};

export default function PlanningPage() {
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [vue, setVue] = useState<Vue>("jour");

  const [dateSelectionnee, setDateSelectionnee] = useState(
    formatDateInput(new Date())
  );
  const [semaineReference, setSemaineReference] = useState(new Date());

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [interventionEnGlissement, setInterventionEnGlissement] =
    useState<string | null>(null);
  const [cibleSurvolee, setCibleSurvolee] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const lundiSemaine = useMemo(
    () => getLundiDeLaSemaine(semaineReference),
    [semaineReference]
  );

  const joursSemaine = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const jour = new Date(lundiSemaine);
      jour.setDate(jour.getDate() + i);
      return jour;
    });
  }, [lundiSemaine]);

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
    chargerPeriodeActuelle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vue, dateSelectionnee, lundiSemaine]);

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

  async function chargerPeriodeActuelle() {
    setLoading(true);
    setErreur("");

    let debut: Date;
    let fin: Date;

    if (vue === "jour") {
      debut = new Date(`${dateSelectionnee}T00:00:00`);
      fin = new Date(`${dateSelectionnee}T23:59:59`);
    } else {
      debut = new Date(lundiSemaine);
      debut.setHours(0, 0, 0, 0);

      fin = new Date(lundiSemaine);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
    }

    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .gte("intervention_date", debut.toISOString())
      .lte("intervention_date", fin.toISOString())
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

  async function reassignerIntervention(
    callId: string,
    nomTechnicien: string | null,
    nouvelleDateISO: string
  ) {
    setEnregistrement(true);

    setCalls((current) =>
      current.map((call) =>
        call.id === callId
          ? {
              ...call,
              technician: nomTechnicien,
              intervention_date: nouvelleDateISO,
            }
          : call
      )
    );

    const { error } = await supabase
      .from("calls")
      .update({
        technician: nomTechnicien,
        intervention_date: nouvelleDateISO,
      })
      .eq("id", callId);

    if (error) {
      console.error("Erreur réassignation :", error);
      setErreur(error.message);
      await chargerPeriodeActuelle();
    }

    setEnregistrement(false);
  }

  function reassignerVersHeure(
    callId: string,
    nomTechnicien: string | null,
    minutesDepuisDebut: number
  ) {
    const minutesClampees = Math.max(
      0,
      Math.min(TOTAL_MINUTES - 15, Math.round(minutesDepuisDebut / 15) * 15)
    );

    const nouvelleDate = new Date(`${dateSelectionnee}T00:00:00`);

    nouvelleDate.setHours(
      START_HOUR + Math.floor(minutesClampees / 60),
      minutesClampees % 60,
      0,
      0
    );

    reassignerIntervention(callId, nomTechnicien, nouvelleDate.toISOString());
  }

  function reassignerVersJour(
    callId: string,
    nomTechnicien: string | null,
    jourCible: Date
  ) {
    const callActuel = calls.find((call) => call.id === callId);

    if (!callActuel || !callActuel.intervention_date) return;

    const ancienneDate = new Date(callActuel.intervention_date);
    const nouvelleDate = new Date(jourCible);

    nouvelleDate.setHours(
      ancienneDate.getHours(),
      ancienneDate.getMinutes(),
      0,
      0
    );

    reassignerIntervention(callId, nomTechnicien, nouvelleDate.toISOString());
  }

  function changerJour(delta: number) {
    const date = new Date(`${dateSelectionnee}T00:00:00`);
    date.setDate(date.getDate() + delta);
    setDateSelectionnee(formatDateInput(date));
  }

  function changerSemaine(delta: number) {
    const date = new Date(lundiSemaine);
    date.setDate(date.getDate() + delta * 7);
    setSemaineReference(date);
  }

  function nonAssigne(call: Call) {
    return !call.technician || call.technician === "vide";
  }

  const colonnes: ColonneCible[] = [
    ...technicians.map((tech) => ({
      cle: tech.id,
      titre: tech.name,
      technicien: tech.name,
    })),
    {
      cle: "__non_assigne__",
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
      <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>
              🗓️ Planning technicien
            </h1>

            <p style={{ marginTop: "8px", color: "#64748b" }}>
              {vue === "jour"
                ? "Faites glisser une intervention verticalement pour changer l'heure, ou vers une autre colonne pour changer de technicien."
                : "Faites glisser une intervention vers un autre jour ou un autre technicien."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setVue("jour")}
              style={boutonBascule(vue === "jour")}
            >
              Jour
            </button>
            <button
              type="button"
              onClick={() => setVue("semaine")}
              style={boutonBascule(vue === "semaine")}
            >
              Semaine
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {vue === "jour" ? (
            <>
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
                style={champDate}
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => changerSemaine(-1)}
                style={boutonNav}
              >
                ← Semaine précédente
              </button>

              <span
                style={{
                  padding: "10px 14px",
                  fontWeight: 700,
                  color: "#334155",
                }}
              >
                {formatPlageSemaine(joursSemaine)}
              </span>

              <button
                type="button"
                onClick={() => changerSemaine(1)}
                style={boutonNav}
              >
                Semaine suivante →
              </button>

              <button
                type="button"
                onClick={() => setSemaineReference(new Date())}
                style={{ ...boutonNav, background: "#2563eb", color: "white" }}
              >
                Cette semaine
              </button>
            </>
          )}
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
        ) : vue === "jour" ? (
          <div style={{ display: "flex", overflowX: "auto", paddingBottom: "12px" }}>
            {/* AXE DES HEURES */}
            <div
              style={{
                width: "56px",
                flexShrink: 0,
                position: "relative",
                height: `${TOTAL_MINUTES}px`,
                marginTop: "44px",
              }}
            >
              {HEURES.map((heure) => (
                <div
                  key={heure}
                  style={{
                    position: "absolute",
                    top: `${(heure - START_HOUR) * 60 - 7}px`,
                    fontSize: "12px",
                    color: "#94a3b8",
                    fontWeight: 700,
                  }}
                >
                  {heure}h
                </div>
              ))}
            </div>

            {/* COLONNES TECHNICIENS */}
            <div style={{ display: "flex", gap: "16px" }}>
              {colonnes.map((colonne) => {
                const interventionsColonne = calls.filter((call) =>
                  colonne.technicien === null
                    ? nonAssigne(call)
                    : call.technician === colonne.technicien
                );

                const survolee = cibleSurvolee === colonne.cle;

                return (
                  <div key={colonne.cle} style={{ width: "260px", flexShrink: 0 }}>
                    <div
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "36px",
                      }}
                    >
                      <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                        {colonne.technicien
                          ? `👷 ${colonne.titre}`
                          : "❔ Non assigné"}
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

                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setCibleSurvolee(colonne.cle);
                      }}
                      onDragLeave={() => {
                        setCibleSurvolee((current) =>
                          current === colonne.cle ? null : current
                        );
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setCibleSurvolee(null);

                        if (!interventionEnGlissement) return;

                        const rect =
                          event.currentTarget.getBoundingClientRect();
                        const offsetY = event.clientY - rect.top;

                        reassignerVersHeure(
                          interventionEnGlissement,
                          colonne.technicien,
                          offsetY
                        );

                        setInterventionEnGlissement(null);
                      }}
                      style={{
                        position: "relative",
                        height: `${TOTAL_MINUTES}px`,
                        background: survolee ? "#eff6ff" : "#f8fafc",
                        border: survolee
                          ? "2px dashed #2563eb"
                          : "1px solid #e2e8f0",
                        borderRadius: "10px",
                        backgroundImage:
                          "repeating-linear-gradient(to bottom, #e2e8f0 0, #e2e8f0 1px, transparent 1px, transparent 60px)",
                      }}
                    >
                      {interventionsColonne.map((call) => {
                        const top = call.intervention_date
                          ? Math.max(
                              0,
                              Math.min(
                                TOTAL_MINUTES - CARD_HEIGHT,
                                minutesDepuisDebut(call.intervention_date)
                              )
                            )
                          : 0;

                        return (
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
                              position: "absolute",
                              top: `${top}px`,
                              left: "4px",
                              right: "4px",
                              height: `${CARD_HEIGHT}px`,
                              padding: "6px 8px",
                              borderRadius: "8px",
                              background: "white",
                              border: "1px solid #e2e8f0",
                              borderLeft: `4px solid ${couleurUrgence(
                                call.urgency
                              )}`,
                              cursor: "grab",
                              overflow: "hidden",
                              opacity:
                                interventionEnGlissement === call.id
                                  ? 0.4
                                  : 1,
                              boxShadow: "0 2px 6px rgba(15,23,42,0.06)",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#64748b",
                                fontWeight: 700,
                              }}
                            >
                              {formatHeure(call.intervention_date)}
                            </div>

                            <strong
                              style={{
                                display: "block",
                                fontSize: "13px",
                                color: "#0f172a",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {call.client_name || "Client non renseigné"}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VUE SEMAINE */
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px" }}>
            {colonnes.map((colonne) => (
              <div key={colonne.cle} style={{ width: "300px", flexShrink: 0 }}>
                <div
                  style={{
                    marginBottom: "10px",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {colonne.technicien ? `👷 ${colonne.titre}` : "❔ Non assigné"}
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {joursSemaine.map((jour) => {
                    const cleCible = `${colonne.cle}|${formatDateInput(jour)}`;
                    const survolee = cibleSurvolee === cleCible;

                    const interventionsJour = calls
                      .filter((call) => {
                        if (!call.intervention_date) return false;

                        const appartientColonne =
                          colonne.technicien === null
                            ? nonAssigne(call)
                            : call.technician === colonne.technicien;

                        if (!appartientColonne) return false;

                        const dateCall = new Date(call.intervention_date);

                        return (
                          dateCall.getFullYear() === jour.getFullYear() &&
                          dateCall.getMonth() === jour.getMonth() &&
                          dateCall.getDate() === jour.getDate()
                        );
                      })
                      .sort((a, b) =>
                        (a.intervention_date || "").localeCompare(
                          b.intervention_date || ""
                        )
                      );

                    return (
                      <div
                        key={cleCible}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setCibleSurvolee(cleCible);
                        }}
                        onDragLeave={() => {
                          setCibleSurvolee((current) =>
                            current === cleCible ? null : current
                          );
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          setCibleSurvolee(null);

                          if (!interventionEnGlissement) return;

                          reassignerVersJour(
                            interventionEnGlissement,
                            colonne.technicien,
                            jour
                          );

                          setInterventionEnGlissement(null);
                        }}
                        style={{
                          padding: "8px",
                          borderRadius: "10px",
                          background: survolee ? "#eff6ff" : "#f8fafc",
                          border: survolee
                            ? "2px dashed #2563eb"
                            : "1px solid #e2e8f0",
                          minHeight: "56px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#475569",
                            marginBottom: "6px",
                          }}
                        >
                          {JOURS_LABELS[jour.getDay() === 0 ? 6 : jour.getDay() - 1]}{" "}
                          {jour.getDate()}/{jour.getMonth() + 1}
                        </div>

                        {interventionsJour.length === 0 ? (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "#cbd5e1",
                            }}
                          >
                            —
                          </p>
                        ) : (
                          <div style={{ display: "grid", gap: "6px" }}>
                            {interventionsJour.map((call) => (
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
                                  padding: "6px 8px",
                                  borderRadius: "8px",
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
                                    fontSize: "11px",
                                    color: "#64748b",
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatHeure(call.intervention_date)}
                                </div>

                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {call.client_name || "Client non renseigné"}
                                </div>

                                <Link
                                  href={`/interventions/${call.id}`}
                                  style={{
                                    fontSize: "11px",
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
              </div>
            ))}
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

function minutesDepuisDebut(dateISO: string) {
  const date = new Date(dateISO);
  return (date.getHours() - START_HOUR) * 60 + date.getMinutes();
}

function getLundiDeLaSemaine(date: Date) {
  const copie = new Date(date);
  const jourSemaine = copie.getDay();
  const decalage = jourSemaine === 0 ? -6 : 1 - jourSemaine;

  copie.setDate(copie.getDate() + decalage);
  copie.setHours(0, 0, 0, 0);

  return copie;
}

function formatPlageSemaine(joursSemaine: Date[]) {
  const premier = joursSemaine[0];
  const dernier = joursSemaine[6];

  const formatteur = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  });

  return `${formatteur.format(premier)} – ${formatteur.format(
    dernier
  )} ${dernier.getFullYear()}`;
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

const champDate: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "9px",
  border: "1px solid #cbd5e1",
  fontWeight: 700,
};

function boutonBascule(actif: boolean): React.CSSProperties {
  return {
    padding: "10px 18px",
    border: "none",
    background: actif ? "#2563eb" : "white",
    color: actif ? "white" : "#334155",
    fontWeight: 700,
    cursor: "pointer",
  };
}