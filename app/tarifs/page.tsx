"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";

type Tarif = {
  id: string;
  name: string;
  category: string;
  base_price: number;
  hourly_rate: number;
  vat_rate: number;
  active: boolean;
  company_id: string;
};

export default function TarifsPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [vatRate, setVatRate] = useState("20");

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

    setCompanyId(profile.company_id);

    await chargerTarifs(profile.company_id);

    setLoading(false);
  }

  async function chargerTarifs(company: string) {
    const { data, error } = await supabase
      .from("service_prices")
      .select("*")
      .eq("company_id", company)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setMessage(error.message);
      return;
    }

    setTarifs((data as Tarif[]) || []);
  }

  function resetForm() {
    setName("");
    setCategory("");
    setBasePrice("");
    setHourlyRate("");
    setVatRate("20");
    setEditingId(null);
  }

  async function enregistrerTarif() {
    if (!companyId) return;

    if (!name.trim()) {
      setMessage("Le nom de la prestation est obligatoire.");
      return;
    }

    if (!category.trim()) {
      setMessage("La catégorie est obligatoire.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      name: name.trim(),
      category: category.trim(),
      base_price: Number(basePrice || 0),
      hourly_rate: Number(hourlyRate || 0),
      vat_rate: Number(vatRate || 0),
      company_id: companyId,
    };

    if (editingId) {
      const { error } = await supabase
        .from("service_prices")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Tarif modifié avec succès.");
    } else {
      const { error } = await supabase
        .from("service_prices")
        .insert({
          ...payload,
          active: true,
        });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Tarif ajouté avec succès.");
    }

    resetForm();

    await chargerTarifs(companyId);

    setSaving(false);
  }

  function modifierTarif(tarif: Tarif) {
    setEditingId(tarif.id);
    setName(tarif.name || "");
    setCategory(tarif.category || "");
    setBasePrice(
      String(Number(tarif.base_price || 0))
    );
    setHourlyRate(
      String(Number(tarif.hourly_rate || 0))
    );
    setVatRate(
      String(Number(tarif.vat_rate || 0))
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function changerActivation(tarif: Tarif) {
    const { error } = await supabase
      .from("service_prices")
      .update({
        active: !tarif.active,
      })
      .eq("id", tarif.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await chargerTarifs(companyId);
  }

  async function supprimerTarif(tarif: Tarif) {
    const confirmer = window.confirm(
      `Supprimer définitivement "${tarif.name}" ?`
    );

    if (!confirmer) return;

    const { error } = await supabase
      .from("service_prices")
      .delete()
      .eq("id", tarif.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (editingId === tarif.id) {
      resetForm();
    }

    setMessage("Tarif supprimé.");

    await chargerTarifs(companyId);
  }

  function prix(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value || 0));
  }

  if (loading) {
    return (
      <MainLayout>
        <p>Chargement des tarifs...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        <div
          style={{
            marginBottom: "28px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0f172a",
            }}
          >
            💶 Mes tarifs
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Configurez les prestations et les prix utilisés
            pour vos estimations et vos devis.
          </p>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "10px",
              background: message.includes("succès")
                ? "#dcfce7"
                : "#fef3c7",
              color: message.includes("succès")
                ? "#166534"
                : "#92400e",
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
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            {editingId
              ? "✏️ Modifier le tarif"
              : "➕ Ajouter une prestation"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "16px",
            }}
          >
            <Field
              label="Nom de la prestation"
              value={name}
              placeholder="Ex : Débouchage canalisation"
              onChange={setName}
            />

            <Field
              label="Catégorie"
              value={category}
              placeholder="Ex : Plomberie"
              onChange={setCategory}
            />

            <Field
              label="Forfait de base (€)"
              value={basePrice}
              type="number"
              placeholder="0"
              onChange={setBasePrice}
            />

            <Field
              label="Tarif horaire (€)"
              value={hourlyRate}
              type="number"
              placeholder="0"
              onChange={setHourlyRate}
            />

            <Field
              label="TVA (%)"
              value={vatRate}
              type="number"
              placeholder="20"
              onChange={setVatRate}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={enregistrerTarif}
              disabled={saving}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 700,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving
                ? "Enregistrement..."
                : editingId
                  ? "✓ Enregistrer les modifications"
                  : "➕ Ajouter le tarif"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "11px 16px",
                  borderRadius: "10px",
                  border:
                    "1px solid #cbd5e1",
                  background: "white",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
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
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
              }}
            >
              📋 Grille tarifaire
            </h2>

            <strong>
              {tarifs.length} prestation
              {tarifs.length > 1 ? "s" : ""}
            </strong>
          </div>

          {tarifs.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Aucun tarif enregistré.
              <br />
              Ajoutez votre première prestation ci-dessus.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      textAlign: "left",
                    }}
                  >
                    <th style={cell}>Prestation</th>
                    <th style={cell}>Catégorie</th>
                    <th style={cell}>Forfait</th>
                    <th style={cell}>Taux horaire</th>
                    <th style={cell}>TVA</th>
                    <th style={cell}>État</th>
                    <th style={cell}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {tarifs.map((tarif) => (
                    <tr key={tarif.id}>
                      <td style={cell}>
                        <strong>
                          {tarif.name}
                        </strong>
                      </td>

                      <td style={cell}>
                        {tarif.category}
                      </td>

                      <td style={cell}>
                        {prix(tarif.base_price)}
                      </td>

                      <td style={cell}>
                        {prix(tarif.hourly_rate)}
                        /h
                      </td>

                      <td style={cell}>
                        {Number(
                          tarif.vat_rate || 0
                        )}{" "}
                        %
                      </td>

                      <td style={cell}>
                        <span
                          style={{
                            display:
                              "inline-flex",
                            padding: "6px 10px",
                            borderRadius:
                              "999px",
                            background:
                              tarif.active
                                ? "#dcfce7"
                                : "#f1f5f9",
                            color:
                              tarif.active
                                ? "#166534"
                                : "#64748b",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          {tarif.active
                            ? "Actif"
                            : "Inactif"}
                        </span>
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
                            type="button"
                            onClick={() =>
                              modifierTarif(
                                tarif
                              )
                            }
                            style={petitBouton}
                          >
                            ✏️ Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              changerActivation(
                                tarif
                              )
                            }
                            style={petitBouton}
                          >
                            {tarif.active
                              ? "⏸ Désactiver"
                              : "▶ Activer"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              supprimerTarif(
                                tarif
                              )
                            }
                            style={{
                              ...petitBouton,
                              background:
                                "#fee2e2",
                              color:
                                "#b91c1c",
                              border:
                                "1px solid #fecaca",
                            }}
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      <span
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#475569",
          fontWeight: 700,
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        step={
          type === "number"
            ? "0.01"
            : undefined
        }
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          border:
            "1px solid #cbd5e1",
          borderRadius: "9px",
          fontSize: "15px",
        }}
      />
    </label>
  );
}

const cell: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  verticalAlign: "middle",
};

const petitBouton: React.CSSProperties = {
  padding: "8px 11px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};