"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import CalendarView from "../../components/CalendarView";

export default function CalendrierPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerInterventions() {
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .order("intervention_date", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Erreur chargement calendrier :",
          error
        );
      } else {
        setCalls(data || []);
      }

      setLoading(false);
    }

    chargerInterventions();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: "32px" }}>
        Chargement du calendrier...
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
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0f172a",
            }}
          >
            📅 Calendrier
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Consultez vos interventions planifiées.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <CalendarView calls={calls} />
        </div>
      </div>
    </main>
  );
}