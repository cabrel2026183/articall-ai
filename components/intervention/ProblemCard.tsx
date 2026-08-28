"use client";

import Card from "../ui/Card";
import type { Call } from "../../lib/types";

type ProblemCardProps = {
  call: Call;
};

export default function ProblemCard({ call }: ProblemCardProps) {
  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>🛠️ Problème</h3>

      <p style={{ color: "#334155", lineHeight: "1.6" }}>
        {call.problem || "Aucun problème renseigné."}
      </p>
    </Card>
  );
}