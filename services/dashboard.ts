export function getDashboardStats(calls: any[]) {
  const caTotal = calls.reduce(
    (total, call) => total + (call.amount || 0),
    0
  );

  const caEncaisse = calls
    .filter((call) => call.payment_status === "paye")
    .reduce((total, call) => total + (call.amount || 0), 0);

  const aEncaisser = caTotal - caEncaisse;

  const clients = new Set(
    calls
      .map((call) => call.client_phone)
      .filter(Boolean)
  ).size;

  const urgents = calls.filter(
    (call) => call.urgency === "urgent"
  ).length;

  const termines = calls.filter(
    (call) => call.status === "termine"
  ).length;

  const appels = calls.length;

  return {
    caTotal,
    caEncaisse,
    aEncaisser,
    clients,
    urgents,
    termines,
    appels,
  };
}