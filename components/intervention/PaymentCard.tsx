"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { supabase } from "../../lib/supabase";
import type { Call, Quote, Invoice } from "../../lib/types";

type PaymentCardProps = {
  call: Call;
};

type QuoteResume = Pick<
  Quote,
  "id" | "quote_number" | "status" | "total" | "created_at"
>;

type InvoiceResume = Pick<
  Invoice,
  "id" | "invoice_number" | "status" | "total_amount"
>;

export default function PaymentCard({
  call,
}: PaymentCardProps) {
  const [quote, setQuote] = useState<QuoteResume | null>(null);
  const [invoice, setInvoice] = useState<InvoiceResume | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);

  const hasInvoice = Boolean(invoice);

  const isPaid = invoice?.status === "paye";

  useEffect(() => {
    chargerDevis();
  }, [call.id]);

  async function chargerDevis() {
    setLoadingQuote(true);

    const { data, error } = await supabase
      .from("quotes")
      .select(`
        id,
        quote_number,
        status,
        total,
        created_at
      `)
      .eq("call_id", call.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle<QuoteResume>();

    if (error) {
      console.error(
        "Erreur chargement devis :",
        error
      );

      setQuote(null);
      setInvoice(null);
      setLoadingQuote(false);
      return;
    }

    setQuote(data || null);

    if (data) {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("id, invoice_number, status, total_amount")
        .eq("quote_id", data.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<InvoiceResume>();

      if (invoiceError) {
        console.error(
          "Erreur chargement facture :",
          invoiceError
        );
        setInvoice(null);
      } else {
        setInvoice(invoiceData || null);
      }
    } else {
      setInvoice(null);
    }

    setLoadingQuote(false);
  }

  const hasQuote = Boolean(quote);

  const quoteAccepted =
    quote?.status === "accepted";

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>
        💼 Situation commerciale
      </h3>

      {/* DEVIS */}
      <div style={ligne}>
        <div>
          <strong>📄 Devis</strong>

          <div style={texteSecondaire}>
            {loadingQuote
              ? "Chargement..."
              : hasQuote
                ? quote?.quote_number ||
                  "Devis créé"
                : "Non créé"}
          </div>

          {hasQuote && (
            <div
              style={{
                marginTop: "7px",
              }}
            >
              <Badge
                variant={
                  quoteAccepted
                    ? "success"
                    : quote?.status ===
                        "refused"
                      ? "danger"
                      : "info"
                }
              >
                {quoteAccepted
                  ? "Accepté"
                  : quote?.status ===
                      "refused"
                    ? "Refusé"
                    : quote?.status ===
                        "sent"
                      ? "Envoyé"
                      : "Brouillon"}
              </Badge>
            </div>
          )}
        </div>

        {hasQuote ? (
          <Link
            href={`/devis/${quote?.id}`}
            style={boutonSecondaire}
          >
            Voir
          </Link>
        ) : (
          <Link
            href={`/devis/nouveau?callId=${call.id}`}
            style={boutonPrincipal}
          >
            + Créer
          </Link>
        )}
      </div>

      {/* FACTURE */}
      <div style={ligne}>
        <div>
          <strong>🧾 Facture</strong>

          <div style={texteSecondaire}>
            {hasInvoice
              ? invoice?.invoice_number
              : "Non créée"}
          </div>
        </div>

        {hasInvoice ? (
          <Link
            href={`/factures/${invoice?.id}`}
            style={boutonSecondaire}
          >
            Voir
          </Link>
        ) : quoteAccepted ? (
          <Link
            href={`/devis/${quote?.id}`}
            style={boutonFacture}
          >
            + Créer la facture
          </Link>
        ) : hasQuote ? (
          <span
            style={{
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            Après acceptation
          </span>
        ) : (
          <span
            style={{
              fontSize: "13px",
              color: "#94a3b8",
            }}
          >
            Après devis
          </span>
        )}
      </div>

      {/* MONTANT */}
      {hasInvoice && Number(invoice?.total_amount || 0) > 0 && (
        <div style={ligneSimple}>
          <strong>Montant</strong>

          <strong>
            {Number(
              invoice?.total_amount
            ).toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
            })}
          </strong>
        </div>
      )}

      {/* PAIEMENT */}
      {hasInvoice && (
        <div style={ligneSimple}>
          <strong>
            💳 Paiement
          </strong>

          <Badge
            variant={
              isPaid
                ? "success"
                : "warning"
            }
          >
            {isPaid
              ? "Payée"
              : "En attente"}
          </Badge>
        </div>
      )}

      {!hasInvoice && !quoteAccepted && (
        <p
          style={{
            margin:
              "16px 0 0",
            paddingTop: "14px",
            borderTop:
              "1px solid #e2e8f0",
            color: "#64748b",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          La facture sera disponible après
          acceptation du devis.
        </p>
      )}
    </Card>
  );
}

const ligne: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "14px 0",
  borderBottom:
    "1px solid #f1f5f9",
};

const ligneSimple: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  padding: "14px 0",
  borderBottom:
    "1px solid #f1f5f9",
};

const texteSecondaire: React.CSSProperties = {
  marginTop: "5px",
  color: "#64748b",
  fontSize: "14px",
};

const boutonPrincipal: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "13px",
};

const boutonFacture: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: "8px",
  background: "#16a34a",
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "13px",
};

const boutonSecondaire: React.CSSProperties = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "13px",
};