"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Copy,
  UserRound,
  Wrench,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type HeaderProps = {
  call: Call;
};

type FactureResume = {
  total_amount: number | null;
  status: string | null;
};

export default function Header({ call }: HeaderProps) {
  const [copied, setCopied] = useState(false);
  const [facture, setFacture] = useState<FactureResume | null>(null);

  useEffect(() => {
    chargerFactureLiee();
  }, [call?.id]);

  async function chargerFactureLiee() {
    if (!call?.id) {
      setFacture(null);
      return;
    }

    const { data: quoteData, error: quoteError } = await supabase
      .from("quotes")
      .select("id")
      .eq("call_id", call.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string }>();

    if (quoteError || !quoteData) {
      setFacture(null);
      return;
    }

    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoices")
      .select("total_amount, status")
      .eq("quote_id", quoteData.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<FactureResume>();

    if (invoiceError) {
      console.error(
        "Erreur chargement facture liée :",
        invoiceError
      );
      setFacture(null);
      return;
    }

    setFacture(invoiceData || null);
  }

  async function copierNumero() {
    if (!call?.intervention_number) return;

    try {
      await navigator.clipboard.writeText(
        call.intervention_number
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Erreur lors de la copie du numéro :",
        error
      );
    }
  }

  if (!call) {
    return null;
  }

  const interventionDate = call.intervention_date
    ? new Date(call.intervention_date).toLocaleString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "Non planifiée";

  const amount = facture
    ? `${Number(facture.total_amount || 0).toLocaleString(
        "fr-FR"
      )} €`
    : "Aucune facture";

  const technician =
    call.technician &&
    call.technician !== "vide"
      ? call.technician
      : "Non assigné";

  const statusLabel =
    call.status === "nouveau"
      ? "Nouveau"
      : call.status === "rappelé"
      ? "Rappelé"
      : call.status === "termine" ||
        call.status === "terminé"
      ? "Terminé"
      : call.status || "Non défini";

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "24px",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* HAUT DU HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Intervention
            </span>

            <button
              type="button"
              onClick={copierNumero}
              disabled={!call.intervention_number}
              title="Copier le numéro d’intervention"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: copied
                  ? "#dcfce7"
                  : "#f8fafc",
                cursor: call.intervention_number
                  ? "pointer"
                  : "default",
              }}
            >
              <Copy size={15} />
            </button>
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "28px",
              fontWeight: "800",
            }}
          >
            {call.intervention_number ||
              "Numéro en cours..."}
          </h1>

          {copied && (
            <p
              style={{
                margin: "6px 0 0",
                color: "#16a34a",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              ✓ Numéro copié
            </p>
          )}
        </div>

        {/* STATUT */}
        <div
          style={{
            padding: "8px 14px",
            borderRadius: "999px",
            background:
              call.status === "termine" ||
              call.status === "terminé"
                ? "#dcfce7"
                : call.status === "rappelé"
                ? "#fef3c7"
                : "#dbeafe",
            color:
              call.status === "termine" ||
              call.status === "terminé"
                ? "#166534"
                : call.status === "rappelé"
                ? "#92400e"
                : "#1d4ed8",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* INFORMATIONS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginTop: "24px",
        }}
      >
        {/* CLIENT */}
        <InfoCard
          icon={<UserRound size={18} />}
          label="Client"
          value={call.client_name || "Non renseigné"}
        />

        {/* DATE */}
        <InfoCard
          icon={<CalendarDays size={18} />}
          label="Date d’intervention"
          value={interventionDate}
        />

        {/* TECHNICIEN */}
        <InfoCard
          icon={<Wrench size={18} />}
          label="Technicien"
          value={technician}
        />

        {/* MONTANT */}
        <InfoCard
          icon={<CircleDollarSign size={18} />}
          label="Montant"
          value={amount}
        />

        {/* PAIEMENT */}
        <InfoCard
          icon={<Clock3 size={18} />}
          label="Paiement"
          value={
            !facture
              ? "Aucune facture"
              : facture.status === "paye"
                ? "Payé"
                : "Non payé"
          }
        />
      </div>
    </div>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoCard({
  icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "12px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#64748b",
          marginBottom: "7px",
        }}
      >
        {icon}

        <span
          style={{
            fontSize: "12px",
            fontWeight: "700",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          color: "#0f172a",
          fontWeight: "700",
          fontSize: "14px",
        }}
      >
        {value}
      </div>
    </div>
  );
}