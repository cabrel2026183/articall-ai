"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Call, Invoice } from "../../lib/types";

type InvoiceStats = Pick<Invoice, "total_amount" | "status">;

export default function StatistiquesPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [invoices, setInvoices] = useState<InvoiceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function verifierAccesEtCharger() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const email = user.email?.toLowerCase().trim();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      const role = profile?.role || "technicien";

      if (role !== "admin") {
        window.location.href = "/";
        return;
      }

      await chargerStatistiques();
    }

    async function chargerStatistiques() {
      setLoading(true);

      const { data: callsData, error: callsError } = await supabase
        .from("calls")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (callsError) {
        console.error(callsError);
        setErreur(callsError.message);
        setLoading(false);
        return;
      }

      setCalls((callsData as Call[]) || []);

      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("total_amount, status");

      if (invoicesError) {
        console.error(invoicesError);
        setErreur(invoicesError.message);
        setLoading(false);
        return;
      }

      setInvoices((invoicesData as InvoiceStats[]) || []);

      setLoading(false);
    }

    verifierAccesEtCharger();
  }, []);

  const statistiques = useMemo(() => {
    const caTotal = invoices.reduce(
      (total, invoice) =>
        total + Number(invoice.total_amount || 0),
      0
    );

    const caEncaisse = invoices
      .filter(
        (invoice) =>
          invoice.status === "paye"
      )
      .reduce(
        (total, invoice) =>
          total + Number(invoice.total_amount || 0),
        0
      );

    const aEncaisser =
      caTotal - caEncaisse;

    const interventionsTerminees =
      calls.filter(
        (call) =>
          call.status === "termine" ||
          call.status === "terminé"
      ).length;

    const interventionsEnCours =
      calls.filter(
        (call) =>
          call.status !== "termine" &&
          call.status !== "terminé"
      ).length;

    const urgences = calls.filter(
      (call) =>
        call.urgency === "urgent"
    ).length;

    const clients = new Set(
      calls
        .map((call) =>
          call.client_phone ||
          call.client_email ||
          call.client_name
        )
        .filter(Boolean)
    ).size;

    return {
      caTotal,
      caEncaisse,
      aEncaisser,
      interventions: calls.length,
      interventionsTerminees,
      interventionsEnCours,
      urgences,
      clients,
    };
  }, [calls, invoices]);

  function argent(value: number) {
    return new Intl.NumberFormat(
      "fr-FR",
      {
        style: "currency",
        currency: "EUR",
      }
    ).format(value);
  }

  if (loading) {
    return (
      <main style={{ padding: "32px" }}>
        Chargement des statistiques...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#0f172a",
            }}
          >
            📊 Statistiques
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
            }}
          >
            Analysez l’activité et les
            performances de votre entreprise.
          </p>
        </div>

        {erreur && (
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              borderRadius: "10px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {erreur}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
          }}
        >
          <StatCard
            titre="Chiffre d'affaires"
            valeur={argent(
              statistiques.caTotal
            )}
            icone="💰"
          />

          <StatCard
            titre="CA encaissé"
            valeur={argent(
              statistiques.caEncaisse
            )}
            icone="✅"
          />

          <StatCard
            titre="À encaisser"
            valeur={argent(
              statistiques.aEncaisser
            )}
            icone="⏳"
          />

          <StatCard
            titre="Interventions"
            valeur={String(
              statistiques.interventions
            )}
            icone="🔧"
          />

          <StatCard
            titre="Terminées"
            valeur={String(
              statistiques.interventionsTerminees
            )}
            icone="✅"
          />

          <StatCard
            titre="En cours"
            valeur={String(
              statistiques.interventionsEnCours
            )}
            icone="🚚"
          />

          <StatCard
            titre="Clients"
            valeur={String(
              statistiques.clients
            )}
            icone="👥"
          />

          <StatCard
            titre="Urgences"
            valeur={String(
              statistiques.urgences
            )}
            icone="🚨"
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  titre,
  valeur,
  icone,
}: {
  titre: string;
  valeur: string;
  icone: string;
}) {
  return (
    <article
      style={{
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "22px",
        boxShadow:
          "0 8px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <span
          style={{
            color: "#64748b",
            fontWeight: 700,
          }}
        >
          {titre}
        </span>

        <span
          style={{
            fontSize: "23px",
          }}
        >
          {icone}
        </span>
      </div>

      <strong
        style={{
          display: "block",
          color: "#0f172a",
          fontSize: "27px",
        }}
      >
        {valeur}
      </strong>
    </article>
  );
}