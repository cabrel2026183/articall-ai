export type InterventionData = {
  client_name?: string | null;
  problem?: string | null;
  notes?: string | null;
  work_done?: string | null;
  technician?: string | null;
  payment_status?: string | null;
  status?: string | null;
};

export function genererResumeIntervention(
  intervention: InterventionData
) {
  const phrases: string[] = [];

  if (intervention.problem) {
    phrases.push(
      `Le client a signalé ${intervention.problem.toLowerCase()}.`
    );
  }

  if (intervention.work_done) {
    phrases.push(
      `Le technicien a réalisé les travaux suivants : ${intervention.work_done}.`
    );
  }

  if (intervention.notes) {
    phrases.push(intervention.notes);
  }

  if (intervention.status === "termine") {
    phrases.push("L'intervention a été menée à son terme.");
  }

  if (intervention.payment_status === "paye") {
    phrases.push("Le règlement a été effectué.");
  }

  return phrases.join(" ");
}