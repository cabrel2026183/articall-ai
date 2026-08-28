"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Card from "../ui/Card";
import type { Call } from "../../lib/types";

type TimelineCardProps = {
  call: Call;
  refreshKey: number;
};

type CallEvent = {
  id: string;
  event_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

export default function TimelineCard({
  call,
  refreshKey,
}: TimelineCardProps) {
  const [events, setEvents] = useState<CallEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerEvenements() {
      setLoading(true);

      const { data, error } = await supabase
        .from("call_events")
        .select("id, event_type, title, description, created_at")
        .eq("call_id", call.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur chargement timeline :", error);
        setEvents([]);
        setLoading(false);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    }

    if (call?.id) {
      chargerEvenements();
    }
  }, [call.id, refreshKey]);
  
  function obtenirIcone(eventType: string) {
  switch (eventType) {
    case "created":
      return "📞";

    case "scheduled":
      return "📅";

    case "completed":
      return "✅";

    case "payment":
      return "💰";

    case "signature":
      return "✍️";

    case "note":
      return "📝";

    case "photo_before":
      return "📷";

    case "photo_after":
      return "📸";

    case "updated":
      return "✏️";

    case "email":
      return "📧";

    case "invoice":
      return "🧾";

      case "en_route":
  return "🚗";

  case "arrived":
  return "📍";

  case "in_progress":
  return "🔧";

    default:
      return "🕒";
  }
}

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>🕒 Timeline</h3>

      {loading && (
        <p style={{ color: "#64748b" }}>
          Chargement de l’historique...
        </p>
      )}

      {!loading && events.length === 0 && (
        <p style={{ color: "#64748b" }}>
          Aucun événement enregistré.
        </p>
      )}

      {!loading && events.length > 0 && (
        <div style={{ display: "grid", gap: "14px" }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  minWidth: "34px",
                  borderRadius: "50%",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {obtenirIcone(event.event_type)}
              </div>

              <div>
                <strong>{event.title}</strong>

                {event.description && (
                  <p
                    style={{
                      margin: "4px 0",
                      color: "#475569",
                    }}
                  >
                    {event.description}
                  </p>
                )}

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  {new Date(event.created_at).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}