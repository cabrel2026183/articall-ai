"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import type { AuthUser } from "../../lib/types";

const COMPETENCES_METIER: { valeur: string; icone: string; nom: string }[] = [
  { valeur: "plomberie", icone: "🔧", nom: "Plomberie" },
  { valeur: "electricien", icone: "⚡", nom: "Électricité" },
  { valeur: "serrurier", icone: "🔑", nom: "Serrurerie" },
  { valeur: "chauffagiste", icone: "🔥", nom: "Chauffage" },
];

type DisponibiliteTechnicien = "available" | "busy" | "offline" | "absent";

type MaFicheTechnicien = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  skills: string[] | null;
  availability_status: DisponibiliteTechnicien | null;
};

const LIBELLES_DISPONIBILITE: Record<DisponibiliteTechnicien, string> = {
  available: "✅ Disponible",
  busy: "🟠 Occupé",
  offline: "⚫ Hors ligne",
  absent: "🔴 Absent",
};

export default function EspaceTechnicienPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState("");
  const [fiche, setFiche] = useState<MaFicheTechnicien | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [modeEdition, setModeEdition] = useState(false);
  const [competencesChoisies, setCompetencesChoisies] = useState<string[]>(
    []
  );
  const [autresCompetences, setAutresCompetences] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [changementDispo, setChangementDispo] = useState(false);

  useEffect(() => {
    chargerPage();
  }, []);

  async function chargerPage() {
    setLoading(true);
    setErreur("");

    const {
      data: { user: utilisateurConnecte },
    } = await supabase.auth.getUser();

    if (!utilisateurConnecte) {
      window.location.href = "/login";
      return;
    }

    setUser(utilisateurConnecte);

    const { data: profil, error: profilError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", utilisateurConnecte.id)
      .maybeSingle();

    if (profilError) {
      setErreur(profilError.message);
      setLoading(false);
      return;
    }

    const roleFinal = profil?.role || "technicien";

    if (roleFinal === "admin") {
      window.location.href = "/";
      return;
    }

    setRole(roleFinal);

    const { data: ficheData, error: ficheError } = await supabase
      .from("technicians")
      .select("id, name, phone, email, address, skills, availability_status")
      .eq("user_id", utilisateurConnecte.id)
      .maybeSingle<MaFicheTechnicien>();

    if (ficheError) {
      setErreur(ficheError.message);
      setLoading(false);
      return;
    }

    if (!ficheData) {
      setErreur(
        "Votre fiche technicien n'est pas encore configurée. Contactez votre employeur."
      );
      setLoading(false);
      return;
    }

    setFiche(ficheData);

    const competencesActuelles = ficheData.skills || [];
    setCompetencesChoisies(
      competencesActuelles.filter((competence) =>
        COMPETENCES_METIER.some((item) => item.valeur === competence)
      )
    );
    setAutresCompetences(
      competencesActuelles
        .filter(
          (competence) =>
            !COMPETENCES_METIER.some((item) => item.valeur === competence)
        )
        .join(", ")
    );

    setLoading(false);
  }

  function basculerCompetence(valeur: string) {
    setCompetencesChoisies((actuelles) =>
      actuelles.includes(valeur)
        ? actuelles.filter((item) => item !== valeur)
        : [...actuelles, valeur]
    );
  }

  async function enregistrerCompetences() {
    if (!fiche) return;

    const competencesLibres = autresCompetences
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const nouvellesCompetences = [
      ...competencesChoisies,
      ...competencesLibres,
    ];

    setEnregistrement(true);
    setErreur("");

    const { error } = await supabase
      .from("technicians")
      .update({ skills: nouvellesCompetences })
      .eq("id", fiche.id);

    if (error) {
      setErreur(error.message);
      setEnregistrement(false);
      return;
    }

    setFiche({ ...fiche, skills: nouvellesCompetences });
    setModeEdition(false);
    setEnregistrement(false);
  }

  async function changerDisponibilite(statut: DisponibiliteTechnicien) {
    if (!fiche) return;

    setChangementDispo(true);
    setErreur("");

    const { error } = await supabase
      .from("technicians")
      .update({ availability_status: statut })
      .eq("id", fiche.id);

    if (error) {
      setErreur(error.message);
      setChangementDispo(false);
      return;
    }

    setFiche({ ...fiche, availability_status: statut });
    setChangementDispo(false);
  }

  if (loading) {
    return (
      <MainLayout user={user} role={role}>
        <div style={{ padding: "40px" }}>Chargement de votre espace...</div>
      </MainLayout>
    );
  }

  if (!fiche) {
    return (
      <MainLayout user={user} role={role}>
        <div style={{ padding: "40px", maxWidth: "640px" }}>
          <div
            style={{
              padding: "18px",
              borderRadius: "12px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {erreur || "Votre fiche technicien est introuvable."}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} role={role}>
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>
            👷 Mon espace technicien
          </h1>
          <p style={{ marginTop: "8px", color: "#64748b" }}>
            Votre rôle, vos compétences et votre disponibilité.
          </p>
        </div>

        {erreur && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {erreur}
          </div>
        )}

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "20px" }}>
                {fiche.name || "Technicien"}
              </h2>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Technicien
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              color: "#334155",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Email</div>
              <div>{fiche.email || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Téléphone
              </div>
              <div>{fiche.phone || "-"}</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                Adresse / zone de départ
              </div>
              <div>{fiche.address || "-"}</div>
            </div>
          </div>

          <p
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            Pour changer votre adresse ou votre téléphone, contactez votre
            employeur.
          </p>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px" }}>🛠️ Mes compétences</h2>

            {!modeEdition && (
              <button
                type="button"
                onClick={() => setModeEdition(true)}
                style={secondaryButton}
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {!modeEdition ? (
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {(fiche.skills || []).length === 0 ? (
                <span style={{ color: "#94a3b8" }}>
                  Aucune compétence renseignée.
                </span>
              ) : (
                (fiche.skills || []).map((competence) => (
                  <span key={competence} style={chip}>
                    {competence}
                  </span>
                ))
              )}
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {COMPETENCES_METIER.map((competence) => (
                  <button
                    key={competence.valeur}
                    type="button"
                    onClick={() => basculerCompetence(competence.valeur)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      padding: "14px 10px",
                      borderRadius: "12px",
                      border: competencesChoisies.includes(competence.valeur)
                        ? "1.5px solid #2563eb"
                        : "1.5px solid #cbd5e1",
                      background: competencesChoisies.includes(
                        competence.valeur
                      )
                        ? "#eff6ff"
                        : "white",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>
                      {competence.icone}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {competence.nom}
                    </span>
                  </button>
                ))}
              </div>

              <label>
                <span style={labelStyle}>
                  Autres compétences (séparées par une virgule)
                </span>
                <input
                  value={autresCompetences}
                  onChange={(event) =>
                    setAutresCompetences(event.target.value)
                  }
                  placeholder="Ex : climatisation, chauffe-eau"
                  style={fieldStyle}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={enregistrerCompetences}
                  disabled={enregistrement}
                  style={primaryButton}
                >
                  {enregistrement ? "Enregistrement..." : "✓ Enregistrer"}
                </button>

                <button
                  type="button"
                  onClick={() => setModeEdition(false)}
                  style={secondaryButton}
                >
                  Annuler
                </button>
              </div>
            </>
          )}
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
          }}
        >
          <h2 style={{ margin: "0 0 16px", fontSize: "18px" }}>
            📶 Ma disponibilité
          </h2>

          <select
            value={fiche.availability_status || "available"}
            onChange={(event) =>
              changerDisponibilite(
                event.target.value as DisponibiliteTechnicien
              )
            }
            disabled={changementDispo}
            style={{ ...fieldStyle, maxWidth: "260px" }}
          >
            {(
              Object.keys(
                LIBELLES_DISPONIBILITE
              ) as DisponibiliteTechnicien[]
            ).map((valeur) => (
              <option key={valeur} value={valeur}>
                {LIBELLES_DISPONIBILITE[valeur]}
              </option>
            ))}
          </select>
        </section>
      </main>
    </MainLayout>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "7px",
  color: "#475569",
  fontWeight: 700,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "white",
};

const primaryButton: React.CSSProperties = {
  padding: "11px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};

const chip: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "999px",
  background: "#f1f5f9",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
};