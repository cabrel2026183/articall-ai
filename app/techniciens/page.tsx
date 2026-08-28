"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import type { Technician, AuthUser } from "../../lib/types";

export default function TechniciensPage() {
  const [techniciens, setTechniciens] = useState<Technician[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [adresseVerifiee, setAdresseVerifiee] = useState(false);
const [adresseNormalisee, setAdresseNormalisee] = useState("");
const [verificationAdresse, setVerificationAdresse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
const [longitude, setLongitude] = useState<number | null>(null);
  const [skills, setSkills] = useState("");
  const [availabilityStatus, setAvailabilityStatus] =
    useState<Technician["availability_status"]>("available");

  useEffect(() => {
    chargerPage();
  }, []);

  async function chargerPage() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

   
    if (userError || !user) {
      window.location.href = "/login";
      return;
    }
    setUser(user);

    const email = user.email?.toLowerCase().trim();

const { data: profile, error: profileError } =
  await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

    
    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    if (!profile?.company_id) {
  console.error(
    "Profil trouvé mais company_id absent :",
    profile
  );

  setMessage(
    "Aucune entreprise n'est associée à ce compte."
  );

  setLoading(false);
  return;
}

const roleFinal = profile.role || "technicien";

if (roleFinal !== "admin") {
  window.location.href = "/";
  return;
}

setRole(roleFinal);

    setCompanyId(profile.company_id);
    await chargerTechniciens(profile.company_id);
    setLoading(false);
  }


  async function chargerTechniciens(company: string) {
    const { data, error } = await supabase
      .from("technicians")
      .select("*")
      .eq("company_id", company)
      .order("name", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTechniciens((data as Technician[]) || []);
  }

  function resetForm() {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setSkills("");
    setAvailabilityStatus("available");
    setEditingId(null);
    setAdresseVerifiee(false);
setAdresseNormalisee("");
setLatitude(null);
setLongitude(null);
setVerificationAdresse(false);
  }

async function geocoderAdresse(adresse: string) {
  if (!adresse.trim()) {
    return null;
  }

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
      console.error(
        "Erreur géocodage :",
        data.error,
        data.status,
        data.details
      );

      return null;
    }

    return {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      formattedAddress:
        data.formattedAddress || adresse.trim(),
    };
  } catch (error) {
    console.error(
      "Erreur géocodage technicien :",
      error
    );

    return null;
  }
}

async function verifierAdresse() {
  if (!address.trim()) {
    setMessage("Renseignez d'abord une adresse.");
    return;
  }

  setVerificationAdresse(true);
  setMessage("");

  const resultat =
    await geocoderAdresse(address);

  if (!resultat) {
    setMessage(
      "Adresse non reconnue. Vérifiez l'adresse saisie."
    );

    setAdresseVerifiee(false);
    setVerificationAdresse(false);
    return;
  }

  setAdresseNormalisee(
    resultat.formattedAddress
  );

  setLatitude(resultat.latitude);
  setLongitude(resultat.longitude);

  setVerificationAdresse(false);
}

  async function enregistrerTechnicien() {
  if (!companyId) {
    setMessage("Entreprise introuvable.");
    return;
  }

  if (!name.trim()) {
    setMessage("Le nom du technicien est obligatoire.");
    return;
  }

  setSaving(true);
  setMessage("");

  try {
    const skillsArray = skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
  company_id: companyId,
  name: name.trim(),
  phone: phone.trim() || null,
  email: email.trim() || null,

  address:
    adresseNormalisee ||
    address.trim() ||
    null,

  latitude,
  longitude,

  skills: skillsArray,
  availability_status: availabilityStatus,
};

    if (editingId) {
      const { error } = await supabase
        .from("technicians")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        throw error;
      }

      setMessage(
        "Technicien modifié avec succès."
      );
    } else {
      const { error } = await supabase
        .from("technicians")
        .insert({
          ...payload,
          active: true,
        });

      if (error) {
        throw error;
      }

      setMessage(
        "Technicien ajouté avec succès."
      );
    }

    resetForm();
    await chargerTechniciens(companyId);
  } catch (error) {
    console.error(
      "Erreur ajout technicien :",
      error
    );

    const messageErreur =
      error instanceof Error
        ? error.message
        : "Impossible d'enregistrer le technicien.";

    setMessage(messageErreur);
  } finally {
    setSaving(false);
  }
}

  function modifierTechnicien(technicien: Technician) {
    setEditingId(technicien.id);
    setName(technicien.name || "");
    setPhone(technicien.phone || "");
    setEmail(technicien.email || "");
    setAddress(technicien.address || "");
    setSkills((technicien.skills || []).join(", "));
    setAvailabilityStatus(
      technicien.availability_status || "available"
    );
    setLatitude(technicien.latitude ?? null);
    setLongitude(technicien.longitude ?? null);
    setAdresseVerifiee(Boolean(technicien.latitude && technicien.longitude));
    setAdresseNormalisee("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function changerActivation(technicien: Technician) {
    const { error } = await supabase
      .from("technicians")
      .update({
        active: !technicien.active,
      })
      .eq("id", technicien.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await chargerTechniciens(companyId);
  }

  async function changerDisponibilite(
    technicien: Technician,
    statut: Technician["availability_status"]
  ) {
    const { error } = await supabase
      .from("technicians")
      .update({
        availability_status: statut,
      })
      .eq("id", technicien.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await chargerTechniciens(companyId);
  }

  async function supprimerTechnicien(technicien: Technician) {
    const confirmer = window.confirm(
      `Supprimer définitivement "${technicien.name}" ?`
    );

    if (!confirmer) return;

    const { error } = await supabase
      .from("technicians")
      .delete()
      .eq("id", technicien.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (editingId === technicien.id) {
      resetForm();
    }

    setMessage("Technicien supprimé.");
    await chargerTechniciens(companyId);
  }

  if (loading) {
    return (
      <MainLayout user={user} role={role}>
        <p>Chargement des techniciens...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={user} role={role}>
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0f172a",
            }}
          >
            👷 Techniciens
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Gérez les techniciens, leurs compétences et leur disponibilité.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fef3c7",
              color: "#92400e",
            }}
          >
            {message}
          </div>
        )}

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "28px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {editingId
              ? "✏️ Modifier le technicien"
              : "➕ Ajouter un technicien"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <Field
              label="Nom"
              value={name}
              onChange={setName}
              placeholder="Ex : Karim Dupont"
            />

            <Field
              label="Téléphone"
              value={phone}
              onChange={setPhone}
              placeholder="06..."
            />

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="technicien@email.fr"
            />

           <div>
  <span
    style={{
      display: "block",
      marginBottom: "7px",
      color: "#475569",
      fontWeight: 700,
    }}
  >
    Adresse / zone de départ
  </span>

  <div
    style={{
      display: "flex",
      gap: "8px",
      alignItems: "stretch",
    }}
  >
    <input
      value={address}
      placeholder="Ex : 12 rue de Rivoli, 75001 Paris"
      onChange={(e) => {
        setAddress(e.target.value);

        setAdresseVerifiee(false);
        setAdresseNormalisee("");
        setLatitude(null);
        setLongitude(null);
      }}
      style={{
        flex: 1,
        minWidth: 0,
        padding: "11px 12px",
        border: adresseVerifiee
          ? "1px solid #22c55e"
          : "1px solid #cbd5e1",
        borderRadius: "9px",
        fontSize: "15px",
        outline: "none",
        background: adresseVerifiee
          ? "#f0fdf4"
          : "white",
      }}
    />

    <button
      type="button"
      onClick={verifierAdresse}
      disabled={
        verificationAdresse ||
        !address.trim() ||
        adresseVerifiee
      }
      style={{
        padding: "0 16px",
        borderRadius: "9px",
        border: adresseVerifiee
          ? "1px solid #86efac"
          : "1px solid #cbd5e1",
        background: adresseVerifiee
          ? "#dcfce7"
          : "#0f172a",
        color: adresseVerifiee
          ? "#166534"
          : "white",
        fontWeight: 700,
        cursor:
          verificationAdresse ||
          !address.trim() ||
          adresseVerifiee
            ? "default"
            : "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {verificationAdresse
        ? "Vérification..."
        : adresseVerifiee
          ? "✓ Confirmée"
          : "📍 Vérifier"}
    </button>
  </div>

  {adresseNormalisee && !adresseVerifiee && (
    <div
      style={{
        marginTop: "10px",
        padding: "13px 14px",
        borderRadius: "10px",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "5px",
        }}
      >
        Adresse reconnue
      </div>

      <strong
        style={{
          display: "block",
          color: "#0f172a",
          marginBottom: "12px",
        }}
      >
        📍 {adresseNormalisee}
      </strong>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setAddress(adresseNormalisee);
            setAdresseVerifiee(true);
            setMessage("");
          }}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            border: "none",
            background: "#16a34a",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ✓ Utiliser cette adresse
        </button>

        <button
          type="button"
          onClick={() => {
            setAdresseNormalisee("");
            setAdresseVerifiee(false);
            setLatitude(null);
            setLongitude(null);
          }}
          style={{
            padding: "9px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "white",
            color: "#334155",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Modifier
        </button>
      </div>
    </div>
  )}
</div>

            <Field
              label="Compétences"
              value={skills}
              onChange={setSkills}
              placeholder="Plomberie, Chauffage"
            />

            <label>
              <span style={labelStyle}>Disponibilité</span>

              <select
                value={availabilityStatus}
                onChange={(e) =>
                  setAvailabilityStatus(
                    e.target.value as Technician["availability_status"]
                  )
                }
                style={fieldStyle}
              >
                <option value="available">✅ Disponible</option>
                <option value="busy">🟠 Occupé</option>
                <option value="offline">⚫ Hors ligne</option>
                <option value="absent">🔴 Absent</option>
              </select>
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              onClick={enregistrerTechnicien}
              disabled={saving}
              style={primaryButton}
            >
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "✓ Enregistrer"
                  : "➕ Ajouter"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={secondaryButton}
              >
                Annuler
              </button>
            )}
          </div>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2 style={{ margin: 0 }}>
              📋 Équipe ({techniciens.length})
            </h2>
          </div>

          {techniciens.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Aucun technicien enregistré.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      textAlign: "left",
                    }}
                  >
                    <th style={cell}>Nom</th>
                    <th style={cell}>Contact</th>
                    <th style={cell}>Adresse</th>
                    <th style={cell}>Compétences</th>
                    <th style={cell}>Disponibilité</th>
                    <th style={cell}>État</th>
                    <th style={cell}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {techniciens.map((technicien) => (
                    <tr key={technicien.id}>
                      <td style={cell}>
                        <strong>{technicien.name}</strong>
                      </td>

                      <td style={cell}>
                        <div>{technicien.phone || "-"}</div>
                        <div
                          style={{
                            color: "#64748b",
                            marginTop: "4px",
                          }}
                        >
                          {technicien.email || "-"}
                        </div>
                      </td>

                      <td style={cell}>
                        {technicien.address || "-"}
                      </td>

                      <td style={cell}>
                        {(technicien.skills || []).length > 0
                          ? (technicien.skills || []).join(", ")
                          : "-"}
                      </td>

                      <td style={cell}>
                        <select
                          value={technicien.availability_status}
                          onChange={(e) =>
                            changerDisponibilite(
                              technicien,
                              e.target.value as Technician["availability_status"]
                            )
                          }
                          style={{
                            ...fieldStyle,
                            marginTop: 0,
                            minWidth: "140px",
                          }}
                        >
                          <option value="available">✅ Disponible</option>
                          <option value="busy">🟠 Occupé</option>
                          <option value="offline">⚫ Hors ligne</option>
                          <option value="absent">🔴 Absent</option>
                        </select>
                      </td>

                      <td style={cell}>
                        {technicien.active ? "✅ Actif" : "⏸ Inactif"}
                      </td>

                      <td style={cell}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              modifierTechnicien(technicien)
                            }
                            style={secondaryButton}
                          >
                            ✏️ Modifier
                          </button>

                          <button
                            onClick={() =>
                              changerActivation(technicien)
                            }
                            style={secondaryButton}
                          >
                            {technicien.active
                              ? "⏸ Désactiver"
                              : "▶ Activer"}
                          </button>

                          <button
                            onClick={() =>
                              supprimerTechnicien(technicien)
                            }
                            style={dangerButton}
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </MainLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <span style={labelStyle}>{label}</span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={fieldStyle}
      />
    </label>
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
  padding: "8px 11px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};

const dangerButton: React.CSSProperties = {
  ...secondaryButton,
  background: "#fee2e2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
};

const cell: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  verticalAlign: "middle",
};