"use client";

type DashboardProps = {
  calls: any[];
};

export default function Dashboard({
  calls,
}: DashboardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        marginBottom: "20px",
      }}
    >
      <h3>Tableau de bord</h3>

      <p>
        💰 Chiffre d'affaires total :{" "}
        {calls.reduce(
          (total, call) => total + (call.amount || 0),
          0
        )} €
      </p>

      <p>
        💰 CA encaissé :{" "}
        {calls
          .filter((call) => call.payment_status === "paye")
          .reduce(
            (total, call) => total + (call.amount || 0),
            0
          )} €
      </p>

      <p>
        ⏳ Reste à encaisser :{" "}
        {calls
          .filter((call) => call.payment_status !== "paye")
          .reduce(
            (total, call) => total + (call.amount || 0),
            0
          )} €
      </p>

      <p>Nombre total d'appels : {calls.length}</p>

      <p>
        🔴 Urgents :{" "}
        {calls.filter(
          (call) => call.urgency === "urgent"
        ).length}
      </p>

      <p>
        🟠 Importants :{" "}
        {calls.filter(
          (call) => call.urgency === "important"
        ).length}
      </p>

      <p>
        🟢 Normaux :{" "}
        {calls.filter(
          (call) => call.urgency === "normal"
        ).length}
      </p>

      <p>
        Nouveaux :{" "}
        {calls.filter(
          (call) => call.status === "nouveau"
        ).length}
      </p>

      <p>
        Rappelés :{" "}
        {calls.filter(
          (call) => call.status === "rappelé"
        ).length}
      </p>

      <p>
        Terminés :{" "}
        {calls.filter(
          (call) => call.status === "termine"
        ).length}
      </p>
    </div>
  );
}