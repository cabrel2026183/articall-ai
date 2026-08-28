"use client";

import { useState } from "react";
import type { Call } from "../../lib/types";

type NotificationBellProps = {
  calls?: Call[];
};

export default function NotificationBell({ calls = [] }: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const urgences = calls.filter(
    (call) => call.urgency === "urgent" && call.status !== "termine"
  );
  const impayes = calls.filter(
    (call) => call.payment_status !== "paye"
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