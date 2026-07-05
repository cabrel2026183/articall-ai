"use client";

type ClientsTableProps = {
  clients: any[];
};

export default function ClientsTable({ clients }: ClientsTableProps) {
  return (
    <div style={{ marginTop: "20px", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={cell}>Nom</th>
            <th style={cell}>Téléphone</th>
            <th style={cell}>Email</th>
            <th style={cell}>Adresse</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr key={client.client_phone}>
              <td style={cell}>{client.client_name}</td>
              <td style={cell}>{client.client_phone}</td>
              <td style={cell}>{client.client_email || "-"}</td>
              <td style={cell}>{client.address || "-"}</td>
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
};