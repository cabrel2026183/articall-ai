"use client";

type InterventionsTableProps = {
  calls: any[];
  afficherDate: (date: string) => string;
  setSelectedCall: (call: any) => void;
};
export default function InterventionsTable({
  calls,
  afficherDate,
  setSelectedCall,
}: InterventionsTableProps) {
  return (
    <div
      style={{
        marginTop: "30px",
        overflowX: "auto",
      }}
    >
      <h2>📋 Tableau des interventions</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>Client</th>
            <th style={th}>Téléphone</th>
            <th style={th}>Technicien</th>
            <th style={th}>Date</th>
            <th style={th}>Montant</th>
            <th style={th}>Paiement</th>
            <th style={th}>Statut</th>
            <th style={th}>Urgence</th>
          </tr>
        </thead>

        <tbody>
          {calls.map((call) => (
            <tr
  key={call.id}
  onClick={() => setSelectedCall(call)}
  style={{ cursor: "pointer" }}
>
              <td style={td}>{call.client_name}</td>

              <td style={td}>{call.client_phone}</td>

              <td style={td}>
                {call.technician && call.technician !== "vide" ? call.technician : "-"}
              </td>

              <td style={td}>
                {afficherDate(call.created_at)}
              </td>

              <td style={td}>
                {call.amount || 0} €
              </td>

              <td style={td}>
                {call.payment_status === "paye"
                  ? "✅ Payé"
                  : "💸 Non payé"}
              </td>

              <td style={td}>
                {call.status === "nouveau"
                  ? "🟡 Nouveau"
                  : call.status === "rappelé"
                  ? "🟢 Rappelé"
                  : "🔵 Terminé"}
              </td>

              <td style={td}>
                {call.urgency === "urgent"
                  ? "🔴"
                  : call.urgency === "important"
                  ? "🟠"
                  : "🟢"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
};