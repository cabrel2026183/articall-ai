"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <section>
      <h2
        style={{
          margin: "0 0 14px",
          fontSize: "20px",
          color: "#0f172a",
        }}
      >
        📌 Mes actions du jour
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px",
        }}
      >
        <ActionTile
          label="Interventions aujourd'hui"
          value={interventionsDuJour.length}
          icon="📅"
          couleur="#2563eb"
        />
        <ActionTile
          label="Urgences à traiter"
          value={urgences.length}
          icon="🚨"
          couleur="#dc2626"
          alerte={urgences.length > 0}
        />
        <ActionTile
          label="Clients à rappeler"
          value={clientsARappeler.length}
          icon="📞"
          couleur="#7c3aed"
        />
        <ActionTile
          label="Factures à encaisser"
          value={facturesAEncaisser}
          icon="💰"
          couleur="#d97706"
          href="/factures"
        />
      </div>
    </section>
  );
}

type ActionTileProps = {
  label: string;
  value: number;
  icon: string;
  couleur: string;
  alerte?: boolean;
  href?: string;
};

function ActionTile({
  label,
  value,
  icon,
  couleur,
  alerte,
  href,
}: ActionTileProps) {
  const contenu = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 18px",
        borderRadius: "14px",
        background: alerte ? "#fef2f2" : "white",
        border: "1px solid #e2e8f0",
        borderLeft: `5px solid ${couleur}`,
        boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: "26px" }}>{icon}</div>

      <div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            lineHeight: 1,
            color: alerte ? "#b91c1c" : "#0f172a",
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {contenu}
      </Link>
    );
  }

  return contenu;
}