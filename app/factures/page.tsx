"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Invoice, PaymentStatus } from "../../lib/types";

type FactureRow = Pick<
  Invoice,
  | "id"
  | "invoice_number"
  | "customer_name"
  | "customer_phone"
  | "customer_email"
  | "total_amount"
  | "status"
  | "due_date"
  | "created_at"
>;

export default function FacturesPage() {
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [recherche, setRecherche] = useState("");
  const [filtrePaiement, setFiltrePaiement] = useState("tous");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    verifierAccesEtCharger();
  }, []);

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

    setCheckingAccess(false);
    await chargerFactures();
  }

  async function chargerFactures() {
    setChargement(true);
    setErreur("");

    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
          id,
          invoice_number,
          customer_name,
          customer_phone,
          customer_email,
          total_amount,
          status,
          due_date,
          created_at
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErreur(error.message);
      setFactures([]);
    } else {
      setFactures((data as FactureRow[]) || []);
    }

    setChargement(false);
  }

  const facturesFiltrees = useMemo(() => {
    const texte = recherche.toLowerCase().trim();

    return factures.filter((facture) => {
      const correspondRecherche =
        !texte ||
        facture.invoice_number?.toLowerCase().includes(texte) ||
        facture.customer_name?.toLowerCase().includes(texte) ||
        facture.customer_email?.toLowerCase().includes(texte) ||
        facture.customer_phone?.toLowerCase().includes(texte);

      const correspondPaiement =
        filtrePaiement === "tous" ||
        (filtrePaiement === "paye" && facture.status === "paye") ||
        (filtrePaiement === "non_paye" && facture.status !== "paye");

      return correspondRecherche && correspondPaiement;
    });
  }, [factures, recherche, filtrePaiement]);

  const chiffreAffaires = factures.reduce(
    (total, facture) => total + Number(facture.total_amount || 0),
    0
  );

  const montantEncaisse = factures
    .filter((facture) => facture.status === "paye")
    .reduce(
      (total, facture) => total + Number(facture.total_amount || 0),
      0
    );

  const montantRestant = chiffreAffaires - montantEncaisse;

  function afficherDate(date: string | null) {
    if (!date) return "Non renseignée";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function afficherMontant(montant: number | null) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(Number(montant || 0));
  }

  if (checkingAccess) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          padding: "32px",
        }}
      >
        <p style={{ color: "#64748b" }}>Chargement...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                color: "#0f172a",
              }}
            >
              🧾 Factures
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#64748b",
              }}
            >
              Consultez et suivez toutes les factures générées.
            </p>
          </div>

          <Link
            href="/"
            style={{
              padding: "12px 18px",
              backgroundColor: "#0f172a",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ← Tableau de bord
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <StatCard
            titre="Nombre de factures"
            valeur={String(factures.length)}
            icone="📄"
          />

          <StatCard
            titre="Montant total"
            valeur={afficherMontant(chiffreAffaires)}
            icone="💰"
          />

          <StatCard
            titre="Montant encaissé"
            valeur={afficherMontant(montantEncaisse)}
            icone="✅"
          />

          <StatCard
            titre="À encaisser"
            valeur={afficherMontant(montantRestant)}
            icone="⏳"
          />
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Rechercher un numéro, un client..."
            style={{
              flex: "1 1 280px",
              padding: "12px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
              fontSize: "15px",
              outline: "none",
            }}
          />

          <select
            value={filtrePaiement}
            onChange={(event) =>
              setFiltrePaiement(event.target.value)
            }
            style={{
              minWidth: "190px",
              padding: "12px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
              backgroundColor: "white",
              fontSize: "15px",
            }}
          >
            <option value="tous">Tous les paiements</option>
            <option value="paye">Payées</option>
            <option value="non_paye">Non payées</option>
          </select>

          <button
            onClick={chargerFactures}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "9px",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Actualiser
          </button>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            overflowX: "auto",
          }}
        >
          {chargement ? (
            <p
              style={{
                padding: "30px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Chargement des factures...
            </p>
          ) : erreur ? (
            <div
              style={{
                margin: "20px",
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "#fef2f2",
                color: "#b91c1c",
              }}
            >
              Erreur : {erreur}
            </div>
          ) : facturesFiltrees.length === 0 ? (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "42px" }}>🧾</div>

              <h3
                style={{
                  marginBottom: "8px",
                  color: "#0f172a",
                }}
              >
                Aucune facture trouvée
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                }}
              >
                Une facture apparaîtra ici après sa génération depuis
                une intervention.
              </p>
            </div>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "950px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  <Th>Numéro</Th>
                  <Th>Date</Th>
                  <Th>Client</Th>
                  <Th>Échéance</Th>
                  <Th>Montant</Th>
                  <Th>Paiement</Th>
                  <Th>Action</Th>
                </tr>
              </thead>

              <tbody>
                {facturesFiltrees.map((facture) => (
                  <tr
                    key={facture.id}
                    style={{
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <Td>
                      <strong>
                        {facture.invoice_number ||
                          "Sans numéro"}
                      </strong>
                    </Td>

                    <Td>
                      {afficherDate(facture.created_at)}
                    </Td>

                    <Td>
                      <strong>
                        {facture.customer_name ||
                          "Client non renseigné"}
                      </strong>

                      {facture.customer_email && (
                        <div
                          style={{
                            marginTop: "4px",
                            color: "#64748b",
                            fontSize: "13px",
                          }}
                        >
                          {facture.customer_email}
                        </div>
                      )}
                    </Td>

                    <Td>
                      {facture.due_date
                        ? afficherDate(facture.due_date)
                        : "Non renseignée"}
                    </Td>

                    <Td>
                      <strong>
                        {afficherMontant(facture.total_amount)}
                      </strong>
                    </Td>

                    <Td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 10px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: "600",
                          backgroundColor:
                            facture.status === "paye"
                              ? "#dcfce7"
                              : "#fef3c7",
                          color:
                            facture.status === "paye"
                              ? "#166534"
                              : "#92400e",
                        }}
                      >
                        {facture.status === "paye"
                          ? "Payée"
                          : "Non payée"}
                      </span>
                    </Td>

                    <Td>
                      <Link
                        href={`/factures/${facture.id}`}
                        style={{
                          display: "inline-block",
                          padding: "8px 13px",
                          borderRadius: "8px",
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          textDecoration: "none",
                          fontWeight: "600",
                        }}
                      >
                        Voir
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "25px",
          marginBottom: "10px",
        }}
      >
        {icone}
      </div>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "14px",
        }}
      >
        {titre}
      </p>

      <strong
        style={{
          display: "block",
          marginTop: "6px",
          color: "#0f172a",
          fontSize: "24px",
        }}
      >
        {valeur}
      </strong>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "15px",
        color: "#475569",
        fontSize: "14px",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "15px",
        color: "#334155",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}