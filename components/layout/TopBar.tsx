"use client";

import { useEffect, useState } from "react";
import NotificationBell from "./NotificationBell";
import type { AuthUser, Call } from "../../lib/types";

type TopBarProps = {
  user?: AuthUser | null;
  role?: string;
  calls?: Call[];
};

export default function TopBar({
  user,
  role,
  calls = [],
}: TopBarProps) {
  const [search, setSearch] = useState("");

  const results = calls.filter((call) => {
    if (!search.trim()) return false;

    const text = `
      ${call.client_name || ""}
      ${call.client_phone || ""}
      ${call.client_email || ""}
      ${call.address || ""}
      ${call.problem || ""}
    `.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email ||
    "Cabrel Engome";

  const initials = displayName
    .split(" ")
    .map((part: string) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

    const [dateDuJour, setDateDuJour] = useState("");

useEffect(() => {
  setDateDuJour(
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
}, []);

  return (
    <header
      style={{
        position: "relative",
        minHeight: "78px",
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        padding: "0 32px",
      }}
    >
      <div>
        <h2 style={{ margin: 0, color: "#0f172a" }}>
          👋 Bonjour {displayName}
        </h2>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "14px",
            textTransform: "capitalize",
          }}
        >
          {dateDuJour}
        </p>
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: "420px",
          position: "relative",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="🔍 Rechercher un client, une intervention..."
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "999px",
            border: "1px solid #e2e8f0",
            outline: "none",
          }}
        />

        {results.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              boxShadow:
                "0 20px 40px rgba(0,0,0,.15)",
              padding: "12px",
              zIndex: 1000,
            }}
          >
            {results.slice(0, 6).map((call) => (
              <div
                key={call.id}
                onClick={() => {
                  window.location.href =
                    `/interventions/${call.id}`;
                }}
                style={{
                  padding: "10px",
                  borderBottom:
                    "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <strong>{call.client_name}</strong>

                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {call.client_phone} — {call.problem}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <button
          type="button"
          style={{
            border: "none",
            background: "#f1f5f9",
            borderRadius: "50%",
            width: "42px",
            height: "42px",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          🌙
        </button>

        <NotificationBell calls={calls} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {initials}
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              {displayName}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              {role === "admin"
                ? "Administrateur"
                : "Technicien"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}