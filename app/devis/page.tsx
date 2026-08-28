"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import type { Quote, QuoteStatus } from "../../lib/types";

type QuoteRow = Pick<
  Quote,
  | "id"
  | "quote_number"
  | "client_name"
  | "client_email"
  | "client_phone"
  | "status"
  | "subtotal"
  | "vat_amount"
  | "discount"
  | "total"
  | "created_at"
>;

const formatCurrency = (value: number | null) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0));
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const getStatusLabel = (status: QuoteStatus | null) => {
  switch (status) {
    case "draft":
      return "Brouillon";

    case "sent":
      return "Envoyé";

    case "accepted":
      return "Accepté";

    case "refused":
      return "Refusé";

    case "expired":
      return "Expiré";

    default:
      return status || "Brouillon";
  }
};

const getStatusStyle = (
  status: QuoteStatus | null
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  };

  switch (status) {
    case "sent":
      return {
        ...baseStyle,
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "accepted":
      return {
        ...baseStyle,
        background: "#dcfce7",
        color: "#15803d",
      };

    case "refused":
      return {
        ...baseStyle,
        background: "#fee2e2",
        color: "#b91c1c",
      };

    case "expired":
      return {
        ...baseStyle,
        background: "#fef3c7",
        color: "#b45309",
      };

    default:
      return {
        ...baseStyle,
        background: "#f1f5f9",
        color: "#475569",
      };
  }
};

export default function DevisPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");
  const [error, setError] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    verifierAccesEtCharger();
  }, []);

  const verifierAccesEtCharger = async () => {
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

    setCheckingAccess(false);
    await loadQuotes();
  };

  const loadQuotes = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("quotes")
      .select(
        `
          id,
          quote_number,
          client_name,
          client_email,
          client_phone,
          status,
          subtotal,
          vat_amount,
          discount,
          total,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Erreur chargement devis :",
        error
      );

      setError(
        `Erreur Supabase : ${error.message}`
      );

      setQuotes([]);
    } else {
      setQuotes((data as QuoteRow[]) ?? []);
    }

    setLoading(false);
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        quote.client_name
          ?.toLowerCase()
          .includes(searchValue) ||
        quote.quote_number
          ?.toLowerCase()
          .includes(searchValue) ||
        quote.client_email
          ?.toLowerCase()
          .includes(searchValue) ||
        quote.client_phone
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  const totalQuotes = quotes.length;

  const draftCount = quotes.filter(
    (quote) =>
      !quote.status ||
      quote.status === "draft"
  ).length;

  const sentCount = quotes.filter(
    (quote) => quote.status === "sent"
  ).length;

  const acceptedCount = quotes.filter(
    (quote) => quote.status === "accepted"
  ).length;

  const refusedCount = quotes.filter(
    (quote) => quote.status === "refused"
  ).length;

  const acceptedAmount = quotes
    .filter(
      (quote) => quote.status === "accepted"
    )
    .reduce((total, quote) => {
      return total + Number(quote.total ?? 0);
    }, 0);

  if (checkingAccess) {
    return (
      <MainLayout>
        <p style={{ padding: "32px" }}>Chargement...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div
        style={{
          padding: "32px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                color: "#0f172a",
              }}
            >
              📄 Devis
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b",
              }}
            >
              Créez, envoyez et suivez les devis
              de vos clients.
            </p>
          </div>

          <Link
            href="/devis/nouveau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 18px",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              boxShadow:
                "0 8px 18px rgba(37, 99, 235, 0.2)",
            }}
          >
            + Nouveau devis
          </Link>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "26px",
          }}
        >
          <StatCard
            title="Tous les devis"
            value={totalQuotes.toString()}
            subtitle="Devis enregistrés"
          />

          <StatCard
            title="Brouillons"
            value={draftCount.toString()}
            subtitle="À finaliser"
          />

          <StatCard
            title="Envoyés"
            value={sentCount.toString()}
            subtitle="En attente de réponse"
          />

          <StatCard
            title="Acceptés"
            value={acceptedCount.toString()}
            subtitle={formatCurrency(
              acceptedAmount
            )}
          />

          <StatCard
            title="Refusés"
            value={refusedCount.toString()}
            subtitle="Devis non retenus"
          />
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderBottom:
                "1px solid #e2e8f0",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="search"
              placeholder="Rechercher un client ou un numéro de devis..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                flex: "1 1 320px",
                minHeight: "44px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
              }}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={{
                minHeight: "44px",
                padding: "0 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                fontSize: "15px",
              }}
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="draft">
                Brouillons
              </option>

              <option value="sent">
                Envoyés
              </option>

              <option value="accepted">
                Acceptés
              </option>

              <option value="refused">
                Refusés
              </option>

              <option value="expired">
                Expirés
              </option>
            </select>

            <button
              type="button"
              onClick={loadQuotes}
              style={{
                minHeight: "44px",
                padding: "0 16px",
                borderRadius: "10px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <div
              style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Chargement des devis...
            </div>
          ) : error ? (
            <div
              style={{
                margin: "20px",
                padding: "16px",
                borderRadius: "10px",
                background: "#fee2e2",
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "44px",
                  marginBottom: "14px",
                }}
              >
                📄
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "22px",
                }}
              >
                Aucun devis trouvé
              </h2>

              <p
                style={{
                  color: "#64748b",
                  marginBottom: "22px",
                }}
              >
                Créez votre premier devis pour
                commencer.
              </p>

              <Link
                href="/devis/nouveau"
                style={{
                  display: "inline-flex",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Créer un devis
              </Link>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
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
                    <TableHeader>
                      Numéro
                    </TableHeader>

                    <TableHeader>
                      Client
                    </TableHeader>

                    <TableHeader>
                      Date
                    </TableHeader>

                    <TableHeader>
                      Montant
                    </TableHeader>

                    <TableHeader>
                      Statut
                    </TableHeader>

                    <TableHeader>
                      Actions
                    </TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredQuotes.map(
                    (quote) => (
                      <tr
                        key={quote.id}
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <TableCell>
                          <strong
                            style={{
                              color:
                                "#0f172a",
                            }}
                          >
                            {quote.quote_number ||
                              "Devis sans numéro"}
                          </strong>
                        </TableCell>

                        <TableCell>
                          <div
                            style={{
                              fontWeight: 700,
                              color:
                                "#0f172a",
                            }}
                          >
                            {quote.client_name ||
                              "Client non renseigné"}
                          </div>

                          <div
                            style={{
                              color:
                                "#64748b",
                              fontSize:
                                "13px",
                              marginTop:
                                "4px",
                            }}
                          >
                            {quote.client_email ||
                              quote.client_phone ||
                              "Aucune coordonnée"}
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            quote.created_at
                          )}
                        </TableCell>

                        <TableCell>
                          <strong
                            style={{
                              color:
                                "#0f172a",
                            }}
                          >
                            {formatCurrency(
                              quote.total
                            )}
                          </strong>
                        </TableCell>

                        <TableCell>
                          <span
                            style={getStatusStyle(
                              quote.status
                            )}
                          >
                            {getStatusLabel(
                              quote.status
                            )}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "8px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            <Link
                              href={`/devis/${quote.id}`}
                              style={{
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  "8px",
                                background:
                                  "#eff6ff",
                                color:
                                  "#1d4ed8",
                                textDecoration:
                                  "none",
                                fontWeight:
                                  700,
                                fontSize:
                                  "14px",
                              }}
                            >
                              Voir
                            </Link>

                            <Link
                              href={`/devis/${quote.id}/modifier`}
                              style={{
                                padding:
                                  "8px 12px",
                                borderRadius:
                                  "8px",
                                background:
                                  "#f1f5f9",
                                color:
                                  "#334155",
                                textDecoration:
                                  "none",
                                fontWeight:
                                  700,
                                fontSize:
                                  "14px",
                              }}
                            >
                              Modifier
                            </Link>

                            {quote.status ===
                              "accepted" && (
                              <button
                                type="button"
                                style={{
                                  padding:
                                    "8px 12px",
                                  borderRadius:
                                    "8px",
                                  border:
                                    "none",
                                  background:
                                    "#dcfce7",
                                  color:
                                    "#15803d",
                                  fontWeight:
                                    700,
                                  fontSize:
                                    "14px",
                                  cursor:
                                    "pointer",
                                }}
                                onClick={() =>
                                  alert(
                                    "La transformation en facture sera ajoutée à la prochaine étape."
                                  )
                                }
                              >
                                Facturer
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <article
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontSize: "28px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "13px",
          marginTop: "6px",
        }}
      >
        {subtitle}
      </div>
    </article>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        padding: "14px 18px",
        color: "#475569",
        fontSize: "13px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td
      style={{
        padding: "16px 18px",
        color: "#475569",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}