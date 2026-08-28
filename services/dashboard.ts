import { supabase } from "../lib/supabase";
import type { Call, Invoice } from "../lib/types";

export type DashboardStats = {
  caTotal: number;
  caEncaisse: number;
  aEncaisser: number;
  clients: number;
  urgents: number;
  termines: number;
  appels: number;
};

type InvoiceStats = Pick<Invoice, "total_amount" | "status">;

export async function getDashboardStats(
  calls: Call[]
): Promise<DashboardStats> {
  const clients = new Set(
    calls.map((call) => call.client_phone).filter(Boolean)
  ).size;

  const urgents = calls.filter(
    (call) => call.urgency === "urgent"
  ).length;

  const termines = calls.filter(
    (call) => call.status === "termine"
  ).length;

  const appels = calls.length;

  const { data: invoicesData, error } = await supabase
    .from("invoices")
    .select("total_amount, status");

  if (error) {
    console.error(
      "Erreur chargement chiffre d'affaires :",
      error
    );

    return {
      caTotal: 0,
      caEncaisse: 0,
      aEncaisser: 0,
      clients,
      urgents,
      termines,
      appels,
    };
  }

  const invoices = (invoicesData as InvoiceStats[]) || [];

  const caTotal = invoices.reduce(
    (total, invoice) => total + Number(invoice.total_amount || 0),
    0
  );

  const caEncaisse = invoices
    .filter((invoice) => invoice.status === "paye")
    .reduce(
      (total, invoice) => total + Number(invoice.total_amount || 0),
      0
    );

  const aEncaisser = caTotal - caEncaisse;

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