"use client";

import Link from "next/link";
import type { Call } from "../lib/types";

type ClientRow = Pick<
  Call,
  "id" | "client_name" | "client_phone" | "client_email" | "address"
>;

type ClientsTableProps = {
  clients: ClientRow[];
};

export default function ClientsTable({
  clients,
}: ClientsTableProps) {
  return (
    <div
      style={{
        marginTop: "20px",
        overflowX: "auto",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={cell}>Nom</th>
            <th style={cell}>Téléphone</th>
            <th style={cell}>Email</th>
            <th style={cell}>Adresse</th>
            <th style={cell}>Action</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr
              key={
                client.id ||
                client.client_phone ||
                client.client_email
              }
              style={{
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <td style={cell}>
                <Link
                  href={`/clients/${client.id}`}
                  style={{
                    color: "#2563eb",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  {client.client_name ||
                    "Client non renseigné"}
                </Link>
              </td>

              <td style={cell}>
                {client.client_phone || "-"}
              </td>

              <td style={cell}>
                {client.client_email || "-"}
              </td>

              <td style={cell}>
                {client.address || "-"}
              </td>

              <td style={cell}>
                <Link
                  href={`/clients/${client.id}`}
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#2563eb",
                    color: "white",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Voir la fiche
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};