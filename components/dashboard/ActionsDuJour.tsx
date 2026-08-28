"use client";

import { useEffect, useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type ActionsDuJourProps = {
  calls: Call[];
};

export default function ActionsDuJour({ calls }: ActionsDuJourProps) {
  const today = new Date();

  const [facturesAEncaisser, setFacturesAEncaisser] = useState(0);

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
      setFacturesAEncaisser(0);
      return;
    }

    setFacturesAEncaisser(count ?? 0);
  }

  const interventionsDuJour = calls.filter((call) => {
    if (!call.intervention_date) return false;
    const date = new Date(call.intervention_date);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  const urgences = calls.filter(
    (call) => call.urgency === "urgent" && call.status !== "termine"
  );

  const clientsARappeler = calls.filter(
    (call) => call.status === "nouveau"
  );

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>📌 Mes actions du jour</h3>

      <div style={{ display: "grid", gap: "12px" }}>
        <ActionLine label="Interventions aujourd'hui" value={interventionsDuJour.length} badge="📅" />
        <ActionLine label="Urgences à traiter" value={urgences.length} badge="🚨" danger />
        <ActionLine label="Clients à rappeler" value={clientsARappeler.length} badge="📞" />
        <ActionLine label="Factures à encaisser" value={facturesAEncaisser} badge="💰" warning />
      </div>
    </Card>
  );
}

function ActionLine({
  label,
  value,
  badge,
  danger,
  warning,
}: {
  label: string;
  value: number;
  badge: string;
  danger?: boolean;
  warning?: boolean;
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
      <span>{badge} {label}</span>

      <Badge variant={danger ? "danger" : warning ? "warning" : "info"}>
        {value}
      </Badge>
    </div>
  );
}