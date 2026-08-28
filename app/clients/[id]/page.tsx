"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "../../../components/MainLayout";
import { supabase } from "../../../lib/supabase";

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [devis, setDevis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    async function chargerClient() {
      setLoading(true);
      setMessage("");

      const { data: referenceCall, error: referenceError } =
        await supabase
          .from("calls")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

      if (referenceError) {
        setMessage(referenceError.message);
        setLoading(false);
        return;
      }

      if (!referenceCall) {
        setMessage("Client introuvable.");
        setLoading(false);
        return;
      }

      setClient(referenceCall);

      setClientName(referenceCall.client_name || "");
      setClientPhone(referenceCall.client_phone || "");
      setClientEmail(referenceCall.client_email || "");
      setAddress(referenceCall.address || "");

      let query = supabase
        .from("calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (referenceCall.client_phone) {
        query = query.eq(
          "client_phone",
          referenceCall.client_phone
        );
      } else if (referenceCall.client_email) {
        query = query.eq(
          "client_email",
          referenceCall.client_email
        );
      } else {
        query = query.eq(
          "client_name",
          referenceCall.client_name
        );
      }

      const { data: history, error: historyError } =
  await query;

if (historyError) {
  setMessage(historyError.message);
} else {
  setInterventions(history || []);
}

// CHARGEMENT DES DEVIS DU CLIENT
let devisQuery = supabase
  .from("quotes")
  .select("*")
  .order("created_at", { ascending: false });

if (referenceCall.client_phone) {
  devisQuery = devisQuery.eq(
    "client_phone",
    referenceCall.client_phone
  );
} else if (referenceCall.client_email) {
  devisQuery = devisQuery.eq(
    "client_email",
    referenceCall.client_email
  );
} else {
  devisQuery = devisQuery.eq(
    "client_name",
    referenceCall.client_name
  );
}

const {
  data: devisClient,
  error: devisError,
} = await devisQuery;

if (devisError) {
  console.error(
    "Erreur devis client :",
    devisError
  );
} else {
  setDevis(devisClient || []);
}

setLoading(false);
    }

    if (params.id) {
      chargerClient();
    }
  }, [params.id]);

  const totalFacture = useMemo(() => {
    return interventions.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );
  }, [interventions]);

  const totalEncaisse = useMemo(() => {
    return interventions
      .filter(
        (item) =>
          item.payment_status === "paye"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );
  }, [interventions]);

  const factures = useMemo(() => {
  return interventions.filter(
    (item) => item.invoice_number
  );
}, [interventions]);

  async function enregistrerModifications() {
    if (!client) return;

    setSaving(true);
    setMessage("");

    const ancienTelephone =
      client.client_phone || null;

    const ancienEmail =
      client.client_email || null;

    const ancienNom =
      client.client_name || null;

    let query = supabase
      .from("calls")
      .update({
        client_name: clientName.trim(),
        client_phone:
          clientPhone.trim() || null,
        client_email:
          clientEmail.trim() || null,
        address:
          address.trim() || null,
      });

    if (ancienTelephone) {
      query = query.eq(
        "client_phone",
        ancienTelephone
      );
    } else if (ancienEmail) {
      query = query.eq(
        "client_email",
        ancienEmail
      );
    } else {
      query = query.eq(
        "client_name",
        ancienNom
      );
    }

    const { error } = await query;

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setClient((current: any) => ({
      ...current,
      client_name: clientName.trim(),
      client_phone:
        clientPhone.trim() || null,
      client_email:
        clientEmail.trim() || null,
      address:
        address.trim() || null,
    }));

    setInterventions((current) =>
      current.map((item) => ({
        ...item,
        client_name: clientName.trim(),
        client_phone:
          clientPhone.trim() || null,
        client_email:
          clientEmail.trim() || null,
        address:
          address.trim() || null,
      }))
    );

    setEditing(false);
    setSaving(false);
    setMessage(
      "Informations client mises à jour."
    );
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <p>Chargement du client...</p>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout>
        <h1>Client introuvable</h1>
        <Link href="/clients">
          Retour aux clients
        </Link>
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
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div>
            <Link
              href="/clients"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ← Retour aux clients
            </Link>

            <h1
              style={{
                margin: "14px 0 5px",
                color: "#0f172a",
              }}
            >
              👤 {client.client_name || "Client"}
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
              }}
            >
              Fiche client et historique complet
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setEditing((value) => !value)
              }
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✏️ Modifier
            </button>

            <Link
              href={`/devis/nouveau?callId=${client.id}`}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              📄 Créer un devis
            </Link>

<Link
  href={`/?callId=${client.id}`}
  style={{
    padding: "11px 16px",
    borderRadius: "10px",
    background: "#0f172a",
    color: "white",
    textDecoration: "none",
    fontWeight: 700,
  }}
>
  🔧 Nouvelle intervention
</Link>

          </div>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: message.includes("mise")
                ? "#dcfce7"
                : "#fee2e2",
              color: message.includes("mise")
                ? "#166534"
                : "#b91c1c",
            }}
          >
            {message}
          </div>
        )}

        {editing ? (
          <section
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <h2>Modifier les informations</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(230px, 1fr))",
                gap: "16px",
              }}
            >
              <Field
                label="Nom"
                value={clientName}
                onChange={setClientName}
              />

              <Field
                label="Téléphone"
                value={clientPhone}
                onChange={setClientPhone}
              />

              <Field
                label="Email"
                value={clientEmail}
                onChange={setClientEmail}
              />

              <Field
                label="Adresse"
                value={address}
                onChange={setAddress}
              />
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
                onClick={enregistrerModifications}
                disabled={saving}
                style={{
                  padding: "11px 16px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 700,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {saving
                  ? "Enregistrement..."
                  : "✓ Enregistrer"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditing(false)
                }
                style={{
                  padding: "11px 16px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "10px",
                  background: "white",
                  color: "#334155",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Annuler
              </button>
            </div>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
              marginBottom: "24px",
            }}
          >
            <InfoCard
              title="Téléphone"
              value={
                client.client_phone || "-"
              }
            />

            <InfoCard
              title="Email"
              value={
                client.client_email || "-"
              }
            />

            <InfoCard
              title="Adresse"
              value={client.address || "-"}
            />
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "26px",
          }}
        >
          <InfoCard
            title="Interventions"
            value={String(
              interventions.length
            )}
          />

          <InfoCard
            title="CA total"
            value={formatCurrency(
              totalFacture
            )}
          />

          <InfoCard
            title="Encaissé"
            value={formatCurrency(
              totalEncaisse
            )}
          />

          <InfoCard
            title="À encaisser"
            value={formatCurrency(
              totalFacture -
                totalEncaisse
            )}
          />
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
              }}
            >
              📋 Historique des interventions
            </h2>
          </div>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={cell}>Date</th>
                  <th style={cell}>Intervention</th>
                  <th style={cell}>Montant</th>
                  <th style={cell}>Paiement</th>
                  <th style={cell}>Action</th>
                </tr>
              </thead>

              <tbody>
                {interventions.map(
                  (intervention) => (
                    <tr
                      key={intervention.id}
                    >
                      <td style={cell}>
                        {formatDate(
                          intervention.intervention_date ||
                            intervention.created_at
                        )}
                      </td>

                      <td style={cell}>
                        {intervention.problem ||
                          "-"}
                      </td>

                      <td style={cell}>
                        {formatCurrency(
                          Number(
                            intervention.amount ||
                              0
                          )
                        )}
                      </td>

                      <td style={cell}>
                        {intervention.payment_status ===
                        "paye"
                          ? "✅ Payé"
                          : "💸 Non payé"}
                      </td>

                      <td style={cell}>
                        <Link
                          href={`/interventions/${intervention.id}`}
                          style={{
                            color:
                              "#2563eb",
                            fontWeight: 700,
                            textDecoration:
                              "none",
                          }}
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
  style={{
    marginTop: "24px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
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
      📄 Devis ({devis.length})
    </h2>
  </div>

  {devis.length === 0 ? (
    <p
      style={{
        padding: "20px",
        color: "#64748b",
      }}
    >
      Aucun devis pour ce client.
    </p>
  ) : (
    devis.map((quote) => (
      <div
        key={quote.id}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div>
          <strong>
            {quote.quote_number || "Devis"}
          </strong>

          <div
            style={{
              color: "#64748b",
              marginTop: "5px",
            }}
          >
            {formatCurrency(
              Number(quote.total || 0)
            )}
          </div>
        </div>

        <Link
          href={`/devis/${quote.id}`}
          style={{
            color: "#2563eb",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Voir
        </Link>
      </div>
    ))
  )}
</section>

<section
  style={{
    marginTop: "24px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
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
      🧾 Factures ({factures.length})
    </h2>
  </div>

  {factures.length === 0 ? (
    <p
      style={{
        padding: "20px",
        color: "#64748b",
      }}
    >
      Aucune facture pour ce client.
    </p>
  ) : (
    factures.map((facture) => (
      <div
        key={facture.id}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div>
          <strong>
            {facture.invoice_number}
          </strong>

          <div
            style={{
              color: "#64748b",
              marginTop: "5px",
            }}
          >
            {formatCurrency(
              Number(facture.amount || 0)
            )}
            {" • "}
            {facture.payment_status === "paye"
              ? "✅ Payée"
              : "⏳ À payer"}
          </div>
        </div>

        <Link
          href={`/factures/${facture.id}`}
          style={{
            color: "#2563eb",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Voir
        </Link>
      </div>
    ))
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
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
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          padding: "11px 12px",
          border:
            "1px solid #cbd5e1",
          borderRadius: "9px",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <article
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "18px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "13px",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      <strong
        style={{
          color: "#0f172a",
          fontSize: "18px",
        }}
      >
        {value}
      </strong>
    </article>
  );
}

const cell: React.CSSProperties = {
  padding: "13px",
  borderBottom:
    "1px solid #e2e8f0",
  textAlign: "left",
};