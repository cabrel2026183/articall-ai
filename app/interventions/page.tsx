"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type FactureResume = {
  total_amount: number | null;
  status: string | null;
};

export default function InterventionsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [facturesParIntervention, setFacturesParIntervention] = useState<
    Map<string, FactureResume>
  >(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerInterventions() {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Erreur chargement interventions :",
          error
        );
        setLoading(false);
        return;
      }

      const interventions = (data as Call[]) || [];
      setCalls(interventions);

      await chargerFacturesLiees(interventions);

      setLoading(false);
    }

    async function chargerFacturesLiees(interventions: Call[]) {
      const callIds = interventions.map((call) => call.id);

      if (callIds.length === 0) {
        setFacturesParIntervention(new Map());
        return;
      }

      // Étape 1 : retrouver le devis le plus récent de chaque intervention
      const { data: quotesData, error: quotesError } = await supabase
        .from("quotes")
        .select("id, call_id")
        .in("call_id", callIds)
        .order("created_at", { ascending: false });

      if (quotesError) {
        console.error(
          "Erreur chargement devis liés :",
          quotesError
        );
        setFacturesParIntervention(new Map());
        return;
      }

      const quoteIdByCallId = new Map<string, string>();

      (quotesData as { id: string; call_id: string | null }[] || []).forEach(
        (quote) => {
          if (quote.call_id && !quoteIdByCallId.has(quote.call_id)) {
            quoteIdByCallId.set(quote.call_id, quote.id);
          }
        }
      );

      const quoteIds = Array.from(quoteIdByCallId.values());

      if (quoteIds.length === 0) {
        setFacturesParIntervention(new Map());
        return;
      }

      // Étape 2 : retrouver la facture la plus récente de chaque devis
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("quote_id, total_amount, status")
        .in("quote_id", quoteIds)
        .order("created_at", { ascending: false });

      if (invoicesError) {
        console.error(
          "Erreur chargement factures liées :",
          invoicesError
        );
        setFacturesParIntervention(new Map());
        return;
      }

      const invoiceByQuoteId = new Map<string, FactureResume>();

      (
        invoicesData as {
          quote_id: string | null;
          total_amount: number | null;
          status: string | null;
        }[] || []
      ).forEach((invoice) => {
        if (invoice.quote_id && !invoiceByQuoteId.has(invoice.quote_id)) {
          invoiceByQuoteId.set(invoice.quote_id, {
            total_amount: invoice.total_amount,
            status: invoice.status,
          });
        }
      });

      const resultat = new Map<string, FactureResume>();

      quoteIdByCallId.forEach((quoteId, callId) => {
        const facture = invoiceByQuoteId.get(quoteId);

        if (facture) {
          resultat.set(callId, facture);
        }
      });

      setFacturesParIntervention(resultat);
    }

    chargerInterventions();
  }, []);

  function afficherDate(date: string | null) {
    if (!date) return "Non renseignée";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function afficherMontant(callId: string) {
    const facture = facturesParIntervention.get(callId);

    if (!facture) {
      return "-";
    }

    return Number(facture.total_amount || 0).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
  }

  if (loading) {
    return (
      <main style={{ padding: "32px" }}>
        <p>Chargement des interventions...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0f172a",
            }}
          >
            📋 Interventions
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Consultez et ouvrez toutes vos interventions.
          </p>
        </div>

        {calls.length === 0 ? (
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
            Aucune intervention enregistrée.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
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
                    backgroundColor: "#f1f5f9",
                    textAlign: "left",
                  }}
                >
                  <th style={th}>Client</th>
                  <th style={th}>Téléphone</th>
                  <th style={th}>Intervention</th>
                  <th style={th}>Date</th>
                  <th style={th}>Montant</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    style={{
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <td style={td}>
                      <strong>
                        {call.client_name ||
                          "Client non renseigné"}
                      </strong>
                    </td>

                    <td style={td}>
                      {call.client_phone || "-"}
                    </td>

                    <td style={td}>
                      {call.problem ||
                        "Non renseignée"}
                    </td>

                    <td style={td}>
                      {afficherDate(
                        call.intervention_date ||
                          call.created_at
                      )}
                    </td>

                    <td style={td}>
                      {afficherMontant(call.id)}
                    </td>

                    <td style={td}>
                      {call.status || "Nouveau"}
                    </td>

                    <td style={td}>
                      <Link
                        href={`/interventions/${call.id}`}
                        style={{
                          display: "inline-block",
                          padding: "9px 14px",
                          borderRadius: "9px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          textDecoration: "none",
                          fontWeight: "700",
                        }}
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  padding: "14px",
  color: "#475569",
  fontSize: "13px",
};

const td: React.CSSProperties = {
  padding: "14px",
  color: "#334155",
};