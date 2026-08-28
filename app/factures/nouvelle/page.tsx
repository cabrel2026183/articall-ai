"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import type { Quote, QuoteItem, Invoice } from "../../../lib/types";

type QuoteRow = Pick<
  Quote,
  | "id"
  | "call_id"
  | "company_id"
  | "quote_number"
  | "client_name"
  | "client_phone"
  | "client_email"
  | "address"
  | "status"
  | "subtotal"
  | "discount"
  | "vat_rate"
  | "vat_amount"
  | "total"
  | "notes"
>;

type QuoteItemRow = Pick<
  QuoteItem,
  | "id"
  | "description"
  | "quantity"
  | "unit_price"
  | "vat_rate"
  | "line_subtotal"
  | "vat_amount"
  | "line_total"
  | "position"
>;

function NouvelleFactureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callId =
    searchParams.get("callId");

  const quoteId =
    searchParams.get("quoteId");

  const [devis, setDevis] =
    useState<QuoteRow | null>(null);

  const [lignes, setLignes] =
    useState<QuoteItemRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

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

      await chargerDevis();
    }

    async function chargerDevis() {
      setLoading(true);
      setMessage("");

      if (!callId || !quoteId) {
        setMessage(
          "L'intervention ou le devis est introuvable."
        );
        setLoading(false);
        return;
      }

      const {
        data: quoteData,
        error: quoteError,
      } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .maybeSingle<Quote>();

      if (quoteError) {
        console.error(
          "Erreur chargement devis :",
          quoteError
        );

        setMessage(quoteError.message);
        setLoading(false);
        return;
      }

      if (!quoteData) {
        setMessage(
          "Le devis est introuvable."
        );
        setLoading(false);
        return;
      }

      if (
        quoteData.call_id &&
        quoteData.call_id !== callId
      ) {
        setMessage(
          "Ce devis n'est pas lié à cette intervention."
        );
        setLoading(false);
        return;
      }

      if (
        quoteData.status !== "accepted"
      ) {
        setMessage(
          "Le devis doit être accepté avant de créer la facture."
        );
        setLoading(false);
        return;
      }

      setDevis(quoteData as QuoteRow);

      const {
        data: itemsData,
        error: itemsError,
      } = await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId)
        .order("position", {
          ascending: true,
        });

      if (itemsError) {
        console.error(
          "Erreur chargement prestations :",
          itemsError
        );

        setMessage(itemsError.message);
        setLoading(false);
        return;
      }

      setLignes(
        (itemsData as QuoteItemRow[]) || []
      );

      setLoading(false);
    }

    verifierAccesEtCharger();
  }, [callId, quoteId]);

  async function creerFacture() {
    if (!devis || !callId || !quoteId) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      /*
       * Si une facture existe déjà pour ce devis,
       * on évite d'en créer une deuxième.
       */
      const {
        data: factureExistante,
        error: verificationError,
      } = await supabase
        .from("invoices")
        .select("id")
        .eq("quote_id", quoteId)
        .maybeSingle<Pick<Invoice, "id">>();

      if (verificationError) {
        throw verificationError;
      }

      if (factureExistante) {
        router.push(`/factures/${factureExistante.id}`);
        return;
      }

      const numeroFacture = `FAC-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const invoicePayload = {
        quote_id: devis.id,
        invoice_number: numeroFacture,
        customer_name: devis.client_name || null,
        customer_email: devis.client_email || null,
        customer_phone: devis.client_phone || null,
        customer_address: devis.address || null,
        subtotal: Number(devis.subtotal || 0),
        tax_rate: devis.vat_rate ?? null,
        tax_amount: Number(devis.vat_amount || 0),
        discount_amount: Number(devis.discount || 0),
        total_amount: Number(devis.total || 0),
        status: "non_paye",
        company_id: devis.company_id || null,
      };

      const {
        data: factureCreee,
        error: factureError,
      } = await supabase
        .from("invoices")
        .insert(invoicePayload)
        .select("id")
        .maybeSingle<Pick<Invoice, "id">>();

      if (factureError) {
        throw factureError;
      }

      if (!factureCreee) {
        throw new Error(
          "La facture n'a pas pu être créée."
        );
      }

      const invoiceItemsPayload = lignes.map((ligne, index) => ({
        invoice_id: factureCreee.id,
        description: ligne.description || "Prestation",
        quantity: Number(ligne.quantity ?? 1),
        unit_price: Number(ligne.unit_price ?? 0),
        vat_rate: ligne.vat_rate ?? devis.vat_rate ?? null,
        line_subtotal: ligne.line_subtotal ?? null,
        vat_amount: ligne.vat_amount ?? null,
        line_total: ligne.line_total ?? null,
        position: ligne.position ?? index,
      }));

      if (invoiceItemsPayload.length > 0) {
        const { error: itemsInsertError } = await supabase
          .from("invoice_items")
          .insert(invoiceItemsPayload);

        if (itemsInsertError) {
          // La facture existe déjà mais sans ses lignes : on la supprime
          // pour ne pas laisser une facture vide et incohérente.
          await supabase
            .from("invoices")
            .delete()
            .eq("id", factureCreee.id);

          throw itemsInsertError;
        }
      }

      setMessage(
        `Facture ${numeroFacture} créée avec succès.`
      );

      router.push(`/factures/${factureCreee.id}`);
    } catch (error) {
      console.error(
        "Erreur création facture :",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de créer la facture."
      );
    } finally {
      setSaving(false);
    }
  }

  function argent(
    value:
      | number
      | null
      | undefined
  ) {
    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR",
      }
    ).format(Number(value || 0));
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          Chargement du devis accepté...
        </div>
      </main>
    );
  }

  if (!devis) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              padding: "20px",
              background: "#fee2e2",
              borderRadius: "12px",
              color: "#b91c1c",
              marginBottom: "20px",
            }}
          >
            {message ||
              "Impossible de charger le devis."}
          </div>

          {callId && (
            <Link
              href={`/interventions/${callId}`}
              style={{
                color: "#2563eb",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ← Retour à l'intervention
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "35px 20px 60px",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* BARRE DU HAUT */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
              }}
            >
              🧾 Créer la facture
            </h1>

            <p
              style={{
                margin:
                  "7px 0 0",
                color: "#64748b",
              }}
            >
              Facturation à partir du devis
              accepté.
            </p>
          </div>

          <Link
            href={`/interventions/${callId}`}
            style={{
              padding: "10px 14px",
              borderRadius: "9px",
              border:
                "1px solid #cbd5e1",
              background: "white",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Retour à l'intervention
          </Link>
        </div>

        {/* SOURCE */}
        <div
          style={{
            marginBottom: "20px",
            padding: "15px 18px",
            borderRadius: "12px",
            background: "#dcfce7",
            border:
              "1px solid #bbf7d0",
            color: "#166534",
          }}
        >
          <strong>
            ✓ Devis accepté
          </strong>

          <div
            style={{
              marginTop: "4px",
            }}
          >
            {devis.quote_number ||
              "Devis"}
          </div>
        </div>

        {/* CLIENT */}
        <section style={cardStyle}>
          <h2
            style={{
              margin:
                "0 0 18px",
            }}
          >
            👤 Client
          </h2>

          <div style={infoGrid}>
            <Info
              label="Nom"
              value={
                devis.client_name ||
                "-"
              }
            />

            <Info
              label="Téléphone"
              value={
                devis.client_phone ||
                "-"
              }
            />

            <Info
              label="Email"
              value={
                devis.client_email ||
                "-"
              }
            />

            <Info
              label="Adresse"
              value={
                devis.address || "-"
              }
            />
          </div>
        </section>

        {/* PRESTATIONS */}
        <section
          style={{
            ...cardStyle,
            padding: 0,
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
              }}
            >
              🔧 Prestations
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
                borderCollapse:
                  "collapse",
                minWidth: "720px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  <th style={cell}>
                    Description
                  </th>

                  <th style={cell}>
                    Qté
                  </th>

                  <th style={cell}>
                    Prix HT
                  </th>

                  <th style={cell}>
                    TVA
                  </th>

                  <th style={cell}>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {lignes.map(
                  (ligne) => (
                    <tr
                      key={ligne.id}
                    >
                      <td
                        style={cell}
                      >
                        {
                          ligne.description
                        }
                      </td>

                      <td
                        style={cell}
                      >
                        {
                          ligne.quantity
                        }
                      </td>

                      <td
                        style={cell}
                      >
                        {argent(
                          ligne.unit_price
                        )}
                      </td>

                      <td
                        style={cell}
                      >
                        {
                          ligne.vat_rate ?? 0
                        }{" "}
                        %
                      </td>

                      <td
                        style={cell}
                      >
                        {argent(
                          ligne.line_total ??
                            ligne.quantity *
                              ligne.unit_price *
                              (1 +
                                (ligne.vat_rate ?? 0) /
                                  100)
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* TOTAUX */}
        <section
          style={{
            ...cardStyle,
            marginTop: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "430px",
              marginLeft: "auto",
              display: "grid",
              gap: "12px",
            }}
          >
            <TotalLine
              label="Sous-total HT"
              value={argent(
                devis.subtotal
              )}
            />

            {Number(
              devis.discount || 0
            ) > 0 && (
              <TotalLine
                label="Remise"
                value={`- ${argent(
                  devis.discount
                )}`}
              />
            )}

            <TotalLine
              label="TVA"
              value={argent(
                devis.vat_amount
              )}
            />

            <div
              style={{
                borderTop:
                  "2px solid #e2e8f0",
                paddingTop: "14px",
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "20px",
                fontSize: "21px",
              }}
            >
              <strong>
                Total TTC
              </strong>

              <strong
                style={{
                  color: "#2563eb",
                }}
              >
                {argent(
                  devis.total
                )}
              </strong>
            </div>
          </div>
        </section>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: "#fef3c7",
              color: "#92400e",
            }}
          >
            {message}
          </div>
        )}

        {/* CRÉATION */}
        <div
          style={{
            marginTop: "24px",
            padding: "22px",
            borderRadius: "16px",
            background: "white",
            border:
              "1px solid #e2e8f0",
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            type="button"
            onClick={
              creerFacture
            }
            disabled={saving}
            style={{
              minWidth: "260px",
              padding:
                "14px 22px",
              border: "none",
              borderRadius:
                "11px",
              background:
                "#16a34a",
              color: "white",
              fontSize: "16px",
              fontWeight: 800,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              opacity: saving
                ? 0.6
                : 1,
            }}
          >
            {saving
              ? "Création..."
              : "✓ Créer la facture"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        style={{
          marginBottom: "5px",
          color: "#64748b",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#0f172a",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TotalLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        gap: "20px",
      }}
    >
      <span
        style={{
          color: "#64748b",
        }}
      >
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "22px",
  marginBottom: "20px",
  boxShadow:
    "0 8px 24px rgba(15,23,42,0.04)",
};

const infoGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};

const cell: React.CSSProperties = {
  padding: "14px",
  borderBottom:
    "1px solid #e2e8f0",
};

export default function NouvelleFacturePage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            background: "#f8fafc",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            Chargement de la facture...
          </div>
        </main>
      }
    >
      <NouvelleFactureContent />
    </Suspense>
  );
}