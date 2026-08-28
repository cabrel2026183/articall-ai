"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import type { Call } from "../lib/types";

type InterventionsTableProps = {
  calls: Call[];
  afficherDate: (date: string) => string;
};

type FactureResume = {
  total_amount: number | null;
  status: string | null;
};

export default function InterventionsTable({
  calls,
  afficherDate,
}: InterventionsTableProps) {
  const router = useRouter();

  const [facturesParIntervention, setFacturesParIntervention] = useState<
    Map<string, FactureResume>
  >(new Map());

  useEffect(() => {
    chargerFacturesLiees();
  }, [calls]);

  async function chargerFacturesLiees() {
    const callIds = calls.map((call) => call.id);

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

    (
      quotesData as { id: string; call_id: string | null }[] || []
    ).forEach((quote) => {
      if (quote.call_id && !quoteIdByCallId.has(quote.call_id)) {
        quoteIdByCallId.set(quote.call_id, quote.id);
      }
    });

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

  function ouvrirIntervention(id: string) {
    router.push(`/interventions/${id}`);
  }

  return (
    <div
      style={{
        marginTop: "30px",
        overflowX: "auto",
      }}
    >
      <h2>📋 Tableau des interventions</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>Client</th>
            <th style={th}>Téléphone</th>
            <th style={th}>Technicien</th>
            <th style={th}>Date</th>
            <th style={th}>Montant</th>
            <th style={th}>Paiement</th>
            <th style={th}>Statut</th>
            <th style={th}>Urgence</th>
          </tr>
        </thead>

        <tbody>
          {calls.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  ...td,
                  textAlign: "center",
                  padding: "30px",
                  color: "#64748b",
                }}
              >
                Aucune intervention trouvée.
              </td>
            </tr>
          ) : (
            calls.map((call) => {
              const facture = facturesParIntervention.get(call.id);

              return (
                <tr
                  key={call.id}
                  tabIndex={0}
                  onClick={() => ouvrirIntervention(call.id)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      ouvrirIntervention(call.id);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "#f8fafc";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background =
                      "transparent";
                  }}
                >
                  <td style={td}>
                    <span
                      style={{
                        color: "#2563eb",
                        fontWeight: 700,
                      }}
                    >
                      {call.client_name ||
                        "Client non renseigné"}
                    </span>
                  </td>

                  <td style={td}>
                    {call.client_phone || "-"}
                  </td>

                  <td style={td}>
                    {call.technician &&
                    call.technician !== "vide"
                      ? call.technician
                      : "-"}
                  </td>

                  <td style={td}>
                    {call.created_at
                      ? afficherDate(call.created_at)
                      : "-"}
                  </td>

                  <td style={td}>
                    {facture
                      ? Number(
                          facture.total_amount || 0
                        ).toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) + " €"
                      : "-"}
                  </td>

                  <td style={td}>
                    {!facture
                      ? "-"
                      : facture.status === "paye"
                        ? "✅ Payé"
                        : "💸 Non payé"}
                  </td>

                  <td style={td}>
                    {call.status === "nouveau"
                      ? "🟡 Nouveau"
                      : call.status === "rappelé"
                        ? "🟢 Rappelé"
                        : call.status === "termine" ||
                            call.status === "terminé"
                          ? "🔵 Terminé"
                          : call.status || "-"}
                  </td>

                  <td style={td}>
                    {call.urgency === "urgent"
                      ? "🔴 Urgent"
                      : call.urgency === "important"
                        ? "🟠 Important"
                        : "🟢 Normal"}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  whiteSpace: "nowrap",
};