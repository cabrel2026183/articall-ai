"use client";

import Card from "./ui/Card";
import Section from "./ui/Section";
import StatCard from "./ui/StatCard";
import Badge from "./ui/Badge";
import RevenueChart from "./charts/RevenueChart";
import { getDashboardStats } from "../services/dashboard";

type DashboardProps = {
  calls: any[];
};

export default function Dashboard({ calls }: DashboardProps) {
  const stats = getDashboardStats(calls);

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
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ margin: 0, fontSize: "32px", color: "#0f172a" }}>
          Bonjour Cabrel 👋
        </h1>

        <p style={{ color: "#64748b", marginTop: "8px" }}>
          Voici un résumé de votre activité sur ArtiCall AI.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
        }}
      >
        <StatCard title="CA total" value={`${stats.caTotal} €`} icon="💰" />
        <StatCard title="CA encaissé" value={`${stats.caEncaisse} €`} icon="✅" />
        <StatCard title="À encaisser" value={`${stats.aEncaisser} €`} icon="⏳" />
        <StatCard title="Clients" value={stats.clients} icon="👥" />
        <StatCard title="Appels" value={stats.appels} icon="📞" />
        <StatCard title="Urgences" value={stats.urgents} icon="🚨" />
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
          <RevenueChart calls={calls} />
        </Card>

        <Card>
          <h3>📅 Planning du jour</h3>

          {interventionsDuJour.length === 0 ? (
            <p style={{ color: "#64748b" }}>Aucune intervention aujourd'hui.</p>
          ) : (
            interventionsDuJour.map((call) => (
              <div key={call.id} style={{ marginBottom: "12px" }}>
                <strong>{call.client_name}</strong>
                <p style={{ margin: 0, color: "#64748b" }}>
                  {new Date(call.intervention_date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </Card>
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

              <Badge variant={call.payment_status === "paye" ? "success" : "warning"}>
                {call.payment_status === "paye" ? "Payé" : "À encaisser"}
              </Badge>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="⚠️ Alertes">
        <Card>
          {interventionsEnRetard.length === 0 ? (
            <p style={{ color: "#64748b" }}>Aucune intervention en retard.</p>
          ) : (
            interventionsEnRetard.slice(0, 5).map((call) => (
              <div key={call.id} style={{ marginBottom: "10px" }}>
                <Badge variant="danger">En retard</Badge>{" "}
                <strong>{call.client_name}</strong>
              </div>
            ))
          )}
        </Card>
      </Section>
    </div>
  );
}