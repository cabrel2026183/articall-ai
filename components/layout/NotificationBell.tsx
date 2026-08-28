"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type NotificationBellProps = {
  calls?: Call[];
};

export default function NotificationBell({ calls = [] }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [callsAvecFactureImpayee, setCallsAvecFactureImpayee] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    chargerFacturesImpayees();
  }, [calls]);

  async function chargerFacturesImpayees() {
    const callIds = calls.map((call) => call.id);

    if (callIds.length === 0) {
      setCallsAvecFactureImpayee(new Set());
      return;
    }

    const { data: quotesData, error: quotesError } = await supabase
      .from("quotes")
      .select("id, call_id")
      .in("call_id", callIds);

    if (quotesError) {
      console.error(
        "Erreur chargement devis liés :",
        quotesError
      );
      setCallsAvecFactureImpayee(new Set());
      return;
    }

    const callIdByQuoteId = new Map<string, string>();

    (
      quotesData as { id: string; call_id: string | null }[] || []
    ).forEach((quote) => {
      if (quote.call_id) {
        callIdByQuoteId.set(quote.id, quote.call_id);
      }
    });

    const quoteIds = Array.from(callIdByQuoteId.keys());

    if (quoteIds.length === 0) {
      setCallsAvecFactureImpayee(new Set());
      return;
    }

    const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select("quote_id, status")
      .in("quote_id", quoteIds)
      .neq("status", "paye");

    if (invoicesError) {
      console.error(
        "Erreur chargement factures impayées :",
        invoicesError
      );
      setCallsAvecFactureImpayee(new Set());
      return;
    }

    const resultat = new Set<string>();

    (
      invoicesData as { quote_id: string | null; status: string | null }[] ||
      []
    ).forEach((invoice) => {
      if (!invoice.quote_id) return;

      const callId = callIdByQuoteId.get(invoice.quote_id);

      if (callId) {
        resultat.add(callId);
      }
    });

    setCallsAvecFactureImpayee(resultat);
  }

  const urgences = calls.filter(
    (call) => call.urgency === "urgent" && call.status !== "termine"
  );

  const impayes = calls.filter((call) =>
    callsAvecFactureImpayee.has(call.id)
  );

  const interventionsJour = calls.filter((call) => {
    if (!call.intervention_date) return false;

    const today = new Date();
    const date = new Date(call.intervention_date);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  const notifications = [
    ...urgences.map((call) => `🚨 Urgence : ${call.client_name}`),
    ...impayes.map((call) => `💰 Paiement en attente : ${call.client_name}`),
    ...interventionsJour.map((call) => `📅 Intervention aujourd'hui : ${call.client_name}`),
  ];

  const count = notifications.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          border: "none",
          background: "#f1f5f9",
          borderRadius: "50%",
          width: "42px",
          height: "42px",
          cursor: "pointer",
          fontSize: "18px",
          position: "relative",
        }}
      >
        🔔

        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ef4444",
              color: "white",
              borderRadius: "999px",
              fontSize: "11px",
              padding: "2px 6px",
              fontWeight: "bold",
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "52px",
            right: 0,
            width: "340px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,.15)",
            border: "1px solid #e2e8f0",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <h3 style={{ marginTop: 0 }}>🔔 Notifications</h3>

          {notifications.length === 0 ? (
            <p style={{ color: "#64748b" }}>Aucune notification.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {notifications.slice(0, 8).map((notification, index) => (
                <div key={index}>{notification}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}