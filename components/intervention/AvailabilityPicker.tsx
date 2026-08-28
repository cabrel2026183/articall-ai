"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Technician = {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  skills: string[] | null;
  active: boolean;
  availability_status: string;
};

type AvailabilityPickerProps = {
  address: string;
  problem: string;
  urgency: string;

  interventionDate: string;
  setInterventionDate: (value: string) => void;

  technician: string;
  setTechnician: (value: string) => void;
};

export default function AvailabilityPicker({
  address,
  problem,
  urgency,
  interventionDate,
  setInterventionDate,
  technician,
  setTechnician,
}: AvailabilityPickerProps) {
  const [loading, setLoading] = useState(false);
  const [creneaux, setCreneaux] = useState<string[]>([]);
  const [techniciensCompatibles, setTechniciensCompatibles] =
    useState<Technician[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!address.trim() || !problem.trim()) {
      setCreneaux([]);
      setTechniciensCompatibles([]);
      setMessage("");
      return;
    }
  }, [address, problem]);

  async function geocoderClient(adresse: string) {
  try {
    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: adresse.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return null;
    }

    return {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    };
  } catch (error) {
    console.error(
      "Erreur géocodage client :",
      error
    );

    return null;
  }
}

function calculerDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const rayonTerre = 6371;

  const convertirRadians = (valeur: number) =>
    (valeur * Math.PI) / 180;

  const differenceLatitude =
    convertirRadians(lat2 - lat1);

  const differenceLongitude =
    convertirRadians(lon2 - lon1);

  const a =
    Math.sin(differenceLatitude / 2) ** 2 +
    Math.cos(convertirRadians(lat1)) *
      Math.cos(convertirRadians(lat2)) *
      Math.sin(differenceLongitude / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return rayonTerre * c;
}

  async function trouverMeilleureDisponibilite() {
    setLoading(true);
    setMessage("");
    setCreneaux([]);
    setTechniciensCompatibles([]);

    const positionClient =
  await geocoderClient(address);

if (!positionClient) {
  setMessage(
    "Impossible de localiser l'adresse du client."
  );
  setLoading(false);
  return;
}

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Utilisateur non connecté.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile?.company_id) {
      setMessage("Entreprise introuvable.");
      setLoading(false);
      return;
    }

    const { data: techniciansData, error: techniciansError } =
      await supabase
        .from("technicians")
        .select("*")
        .eq("company_id", profile.company_id)
        .eq("active", true)
        .eq("availability_status", "available");

    if (techniciansError) {
      setMessage(techniciansError.message);
      setLoading(false);
      return;
    }

    const tousTechniciens =
      (techniciansData as Technician[]) || [];

    if (tousTechniciens.length === 0) {
      setMessage(
        "Aucun technicien actif et disponible."
      );
      setLoading(false);
      return;
    }

    const texteProbleme = problem.toLowerCase();

    const compatibles = tousTechniciens.filter(
      (tech) => {
        const skills = tech.skills || [];

        if (skills.length === 0) {
          return true;
        }

        return skills.some((skill) =>
          texteProbleme.includes(
            skill.toLowerCase()
          )
        );
      }
    );

   const candidats =
  compatibles.length > 0
    ? compatibles
    : tousTechniciens;

const candidatsAvecDistance =
  candidats
    .map((tech) => {
      if (
        tech.latitude == null ||
        tech.longitude == null
      ) {
        return {
          ...tech,
          distance: null as number | null,
        };
      }

      return {
        ...tech,

        distance: calculerDistance(
          positionClient.latitude,
          positionClient.longitude,
          Number(tech.latitude),
          Number(tech.longitude)
        ),
      };
    })
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;

      return a.distance - b.distance;
    });

setTechniciensCompatibles(
  candidatsAvecDistance
);

    const maintenant = new Date();

    const finRecherche = new Date();
    finRecherche.setDate(
      finRecherche.getDate() + 7
    );

    const propositions: {
      date: string;
      technician: string;
    }[] = [];

    for (const tech of candidatsAvecDistance) {
      const { data: planningData } =
        await supabase
          .from("calls")
          .select("intervention_date")
          .eq("technician", tech.name)
          .not(
            "intervention_date",
            "is",
            null
          )
          .gte(
            "intervention_date",
            maintenant.toISOString()
          )
          .lte(
            "intervention_date",
            finRecherche.toISOString()
          );

      const datesOccupees = (
        planningData || []
      )
        .map(
          (item) => item.intervention_date
        )
        .filter(Boolean)
        .map((date) => new Date(date));

      for (
        let jour = 0;
        jour < 7;
        jour++
      ) {
        const dateJour = new Date();

        dateJour.setDate(
          dateJour.getDate() + jour
        );

        for (
          let heure = 8;
          heure <= 17;
          heure++
        ) {
          const candidat = new Date(
            dateJour
          );

          candidat.setHours(
            heure,
            0,
            0,
            0
          );

          if (candidat <= maintenant) {
            continue;
          }

          const occupe =
            datesOccupees.some(
              (dateOccupee) =>
                Math.abs(
                  dateOccupee.getTime() -
                    candidat.getTime()
                ) <
                60 * 60 * 1000
            );

          if (!occupe) {
            propositions.push({
              date:
                formatPourInput(
                  candidat
                ),
              technician:
                tech.name,
            });

            break;
          }
        }

        if (
          propositions.some(
            (item) =>
              item.technician ===
              tech.name
          )
        ) {
          break;
        }
      }
    }

    propositions.sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    const meilleurs =
      propositions.slice(0, 6);

    setCreneaux(
      meilleurs.map(
        (item) =>
          `${item.date}|||${item.technician}`
      )
    );

    if (
      urgency === "urgent" &&
      meilleurs.length > 0
    ) {
      setInterventionDate(
        meilleurs[0].date
      );

      setTechnician(
        meilleurs[0].technician
      );
    }

    if (meilleurs.length === 0) {
      setMessage(
        "Aucun créneau disponible dans les 7 prochains jours."
      );
    }

    setLoading(false);
  }

  function formatPourInput(date: Date) {
    const annee =
      date.getFullYear();

    const mois = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const jour = String(
      date.getDate()
    ).padStart(2, "0");

    const heure = String(
      date.getHours()
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes()
    ).padStart(2, "0");

    return `${annee}-${mois}-${jour}T${heure}:${minutes}`;
  }

  function afficherCreneau(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  }

  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "15px",
        border:
          "1px solid #e2e8f0",
        borderRadius: "12px",
        background: "#f8fafc",
      }}
    >
      <strong
        style={{
          display: "block",
          marginBottom: "8px",
        }}
      >
        🤖 Attribution automatique
      </strong>

      <p
        style={{
          color: "#64748b",
          marginTop: 0,
        }}
      >
        Le système recherche un technicien
        compatible et un créneau libre.
      </p>

      {!address.trim() ? (
        <p
          style={{
            color: "#b45309",
          }}
        >
          Renseignez d’abord
          l’adresse du client.
        </p>
      ) : !problem.trim() ? (
        <p
          style={{
            color: "#b45309",
          }}
        >
          Décrivez d’abord le
          problème.
        </p>
      ) : (
        <button
          type="button"
          onClick={
            trouverMeilleureDisponibilite
          }
          disabled={loading}
          style={{
            padding: "10px 14px",
            border: "none",
            borderRadius: "9px",
            background: "#2563eb",
            color: "white",
            fontWeight: 700,
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Recherche..."
            : "✨ Trouver le meilleur technicien"}
        </button>
      )}

      {message && (
        <p
          style={{
            marginTop: "12px",
            color: "#b45309",
          }}
        >
          {message}
        </p>
      )}

      {techniciensCompatibles.length >
        0 && (
        <p
          style={{
            marginTop: "14px",
            color: "#475569",
            fontSize: "14px",
          }}
        >
          {
            techniciensCompatibles.length
          }{" "}
          technicien(s)
          compatible(s) trouvé(s).
        </p>
      )}

      {creneaux.length > 0 && (
        <div
          style={{
            display: "grid",
            gap: "8px",
            marginTop: "14px",
          }}
        >
          {creneaux.map(
            (value) => {
              const [
                date,
                tech,
              ] =
                value.split("|||");

              const actif =
                interventionDate ===
                  date &&
                technician === tech;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setInterventionDate(
                      date
                    );
                    setTechnician(
                      tech
                    );
                  }}
                  style={{
                    padding:
                      "11px 12px",
                    borderRadius:
                      "9px",
                    border: actif
                      ? "2px solid #2563eb"
                      : "1px solid #cbd5e1",
                    background: actif
                      ? "#eff6ff"
                      : "white",
                    cursor:
                      "pointer",
                    textAlign:
                      "left",
                  }}
                >
                  <strong>
                    👷 {tech}
                  </strong>

                  <div
                    style={{
                      marginTop:
                        "4px",
                      color:
                        "#64748b",
                    }}
                  >
                    📅{" "}
                    {afficherCreneau(
                      date
                    )}
                  </div>
                </button>
              );
            }
          )}
        </div>
      )}

      {technician &&
        interventionDate && (
          <div
            style={{
              marginTop: "14px",
              padding: "12px",
              background:
                "#dcfce7",
              borderRadius: "9px",
              color: "#166534",
            }}
          >
            <strong>
              ✓ Attribution proposée
            </strong>

            <div>
              👷 {technician}
            </div>

            <div>
              📅{" "}
              {afficherCreneau(
                interventionDate
              )}
            </div>
          </div>
        )}
    </div>
  );
}