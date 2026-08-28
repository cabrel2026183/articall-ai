"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "./ui/Card";
import Section from "./ui/Section";
import StatCard from "./ui/StatCard";
import Badge from "./ui/Badge";
import ActionsDuJour from "./dashboard/ActionsDuJour";
import RevenueChart from "./charts/RevenueChart";
import { getDashboardStats } from "../services/dashboard";
import type { DashboardStats } from "../services/dashboard";
import type { Call } from "../lib/types";

type DashboardProps = {
  calls: Call[];
};

const STATS_INITIALES: DashboardStats = {
  caTotal: 0,
  caEncaisse: 0,
  aEncaisser: 0,
  clients: 0,
  urgents: 0,
  termines: 0,
  appels: 0,
};

export default function Dashboard({ calls }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(STATS_INITIALES);

  useEffect(() => {
    chargerStats();
  }, [calls]);

  async function chargerStats() {
    const statsCalculees = await getDashboardStats(calls);
    setStats(statsCalculees);
  }

  const today = new Date();

  const interventionsDuJour = calls.filter((call) => {
    if (!call.intervention_date) return false;

    const date = new Date(call.intervention_date);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  const interventionsEnRetard = calls.filter((call) => {
    if (!call.intervention_date) return false;

    const date = new Date(call.intervention_date);

    return date < today && call.status !== "termine";
  });

  const derniersAppels = calls.slice(0, 5);

  return (
    <div>
     <div style={{ marginBottom: "35px" }}>
  <h1
    style={{
      margin: 0,
      fontSize: "34px",
      color: "#0f172a",
      fontWeight: "700",
    }}
  >
    📊 Tableau de bord
  </h1>

  <p
    style={{
      marginTop: "8px",
      color: "#64748b",
      fontSize: "16px",
    }}
  >
    Pilotez votre entreprise en temps réel grâce à ArtiCall AI.
  </p>
</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
        }}
      >

        <StatCard title="Clients" value={stats.clients} icon="👥" />

<Link
  href="/factures"
  style={{
    textDecoration: "none",
    color: "inherit",
  }}
>
  <StatCard
    title="Factures"
    value="Voir"
    icon="🧾"
  />
</Link>

<StatCard title="Appels" value={stats.appels} icon="📞" />
<StatCard title="Urgences" value={stats.urgents} icon="🚨" />
        <StatCard title="CA total" value={`${stats.caTotal} €`} icon="💰" />
        <StatCard title="CA encaissé" value={`${stats.caEncaisse} €`} icon="✅" />
        <StatCard title="À encaisser" value={`${stats.aEncaisser} €`} icon="⏳" />
      </div>

      <div style={{ marginTop: "30px" }}>
  <ActionsDuJour calls={calls} />
</div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Card>
          <h3>📈 Chiffre d'affaires</h3>
          <RevenueChart />
        </Card>

        <div
          style={{
            display: "grid",
            gap: "20px",
          }}
        >
          <Card>
            <h3>📅 Planning du jour</h3>

            {interventionsDuJour.length === 0 ? (
              <p style={{ color: "#64748b" }}>Aucune intervention aujourd'hui.</p>
            ) : (
              interventionsDuJour.map((call) => (
                <div key={call.id} style={{ marginBottom: "12px" }}>
                  <strong>{call.client_name}</strong>
                  <p style={{ margin: 0, color: "#64748b" }}>
                    {call.intervention_date
                      ? new Date(call.intervention_date).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              ))
            )}
          </Card>

          {interventionsEnRetard.length > 0 && (
            <Card>
              <h3 style={{ color: "#b91c1c" }}>
                ⚠️ En retard ({interventionsEnRetard.length})
              </h3>

              {interventionsEnRetard.map((call) => (
                <div
                  key={call.id}
                  style={{
                    marginBottom: "12px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#fef2f2",
                  }}
                >
                  <strong>{call.client_name}</strong>
                  <p style={{ margin: 0, color: "#b91c1c", fontSize: "13px" }}>
                    Prévue le{" "}
                    {call.intervention_date
                      ? new Date(call.intervention_date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Section title="📋 Activité récente">
        <Card>
          {derniersAppels.map((call) => (
            <div
              key={call.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <strong>{call.client_name}</strong>
                <p style={{ margin: 0, color: "#64748b" }}>{call.problem}</p>
              </div>

              <Badge variant={call.status === "termine" ? "success" : "info"}>
                {call.status === "termine" ? "Terminée" : "En cours"}
              </Badge>
            </div>
          ))}
        </Card>
      </Section>

    </div>
  );
}