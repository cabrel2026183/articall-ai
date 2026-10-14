"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "./ui/Card";
import StatCard from "./ui/StatCard";
import Badge from "./ui/Badge";
import ActionsDuJour from "./dashboard/ActionsDuJour";
import RevenueChart from "./charts/RevenueChart";
import { getDashboardStats } from "../services/dashboard";
import type { DashboardStats } from "../services/dashboard";
import type { Call } from "../lib/types";

type DashboardProps = {
  calls: Call[];
  onNouvelAppel?: () => void;
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

const NOMBRE_RETARDS_VISIBLES = 5;

export default function Dashboard({
  calls,
  onNouvelAppel,
}: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(STATS_INITIALES);
  const [tousLesRetards, setTousLesRetards] = useState(false);

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

  // Retards triés du plus ancien au plus récent.
  const interventionsEnRetard = calls
    .filter((call) => {
      if (!call.intervention_date) return false;

      const date = new Date(call.intervention_date);

      return date < today && call.status !== "termine";
    })
    .sort(
      (a, b) =>
        new Date(a.intervention_date as string).getTime() -
        new Date(b.intervention_date as string).getTime()
    );

  const retardsAffiches = tousLesRetards
    ? interventionsEnRetard
    : interventionsEnRetard.slice(0, NOMBRE_RETARDS_VISIBLES);

  const derniersAppels = calls.slice(0, 5);

  return (
    <div style={{ display: "grid", gap: "28px" }}>
      {/* EN-TÊTE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
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
              marginBottom: 0,
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Pilotez votre entreprise en temps réel grâce à ArtiCall AI.
          </p>
        </div>

        {onNouvelAppel && (
          <button
            type="button"
            onClick={onNouvelAppel}
            style={{
              padding: "13px 20px",
              borderRadius: "12px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
            }}
          >
            + Nouvel appel
          </button>
        )}
      </div>

      {/* 1. CE QUI DEMANDE UNE ACTION */}
      <ActionsDuJour calls={calls} />

      {/* 2. CHIFFRES + GRAPHIQUE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "14px",
          }}
        >
          <StatCard title="CA total" value={`${stats.caTotal} €`} icon="💰" />
          <StatCard title="CA encaissé" value={`${stats.caEncaisse} €`} icon="✅" />
          <StatCard title="À encaisser" value={`${stats.aEncaisser} €`} icon="⏳" />

          <Link
            href="/factures"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <StatCard title="Factures" value="Voir" icon="🧾" />
          </Link>

          <StatCard title="Appels" value={stats.appels} icon="📞" />
          <StatCard title="Urgences" value={stats.urgents} icon="🚨" />
          <StatCard title="Clients" value={stats.clients} icon="👥" />
        </div>

        <Card>
          <h3 style={{ marginTop: 0 }}>📈 Chiffre d'affaires</h3>
          <RevenueChart />
        </Card>
      </div>

      {/* 3. PLANNING ET ACTIVITÉ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: "20px" }}>
          <Card>
            <h3 style={{ marginTop: 0 }}>📅 Planning du jour</h3>

            {interventionsDuJour.length === 0 ? (
              <p style={{ color: "#64748b", marginBottom: 0 }}>
                Aucune intervention aujourd'hui.
              </p>
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
              <h3 style={{ marginTop: 0, color: "#b91c1c" }}>
                ⚠️ En retard ({interventionsEnRetard.length})
              </h3>

              {retardsAffiches.map((call) => (
                <div
                  key={call.id}
                  style={{
                    marginBottom: "10px",
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

              {interventionsEnRetard.length > NOMBRE_RETARDS_VISIBLES && (
                <button
                  type="button"
                  onClick={() => setTousLesRetards((valeur) => !valeur)}
                  style={{
                    marginTop: "4px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "white",
                    color: "#b91c1c",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {tousLesRetards
                    ? "Réduire la liste"
                    : `Voir les ${interventionsEnRetard.length}`}
                </button>
              )}
            </Card>
          )}
        </div>

        <Card>
          <h3 style={{ marginTop: 0 }}>📋 Activité récente</h3>

          {derniersAppels.map((call) => (
            <div
              key={call.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
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
      </div>
    </div>
  );
}