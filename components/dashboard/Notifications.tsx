"use client";

import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type NotificationsProps = {
  calls: Call[];
};

export default function Notifications({ calls }: NotificationsProps) {
  const [impayes, setImpayes] = useState(0);

  useEffect(() => {
    chargerFacturesImpayees();
  }, []);

  async function chargerFacturesImpayees() {
    const { count, error } = await supabase
      .from("invoices")
      .select("id", { count: "exact", head: true })
      .neq("status", "paye");

    if (error) {
      console.error(
        "Erreur chargement factures impayées :",
        error
      );
      setImpayes(0);
      return;
    }

    setImpayes(count ?? 0);
  }

  const urgents = calls.filter((call) => call.urgency === "urgent");
  const nonTermines = calls.filter((call) => call.status !== "termine");

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>🔔 Notifications</h3>

      <div style={{ display: "grid", gap: "12px" }}>
        <NotificationLine
          label={`${urgents.length} intervention(s) urgente(s)`}
          variant="danger"
        />

        <NotificationLine
          label={`${impayes} facture(s) à encaisser`}
          variant="warning"
        />

        <NotificationLine
          label={`${nonTermines.length} intervention(s) non terminée(s)`}
          variant="info"
        />
      </div>
    </Card>
  );
}

function NotificationLine({
  label,
  variant,
}: {
  label: string;
  variant: "danger" | "warning" | "info";
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #e2e8f0",
        paddingBottom: "10px",
      }}
    >
      <span>{label}</span>
      <Badge variant={variant}>À voir</Badge>
    </div>
  );
}