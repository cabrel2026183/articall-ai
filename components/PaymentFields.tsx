"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Tarif = {
  id: string;
  name: string;
  category: string;
  base_price: number | null;
  hourly_rate: number | null;
  vat_rate: number | null;
};

type PaymentFieldsProps = {
  amount: string;
  setAmount: (value: string) => void;

  paymentStatus: string;
  setPaymentStatus: (value: string) => void;

  problem: string;
};

export default function PaymentFields({
  amount,
  setAmount,
  paymentStatus,
  setPaymentStatus,
  problem,
}: PaymentFieldsProps) {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [tarifId, setTarifId] = useState("");
  const [duree, setDuree] = useState("1");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerTarifs() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.company_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("service_prices")
        .select(`
          id,
          name,
          category,
          base_price,
          hourly_rate,
          vat_rate
        `)
        .eq("company_id", profile.company_id)
        .eq("active", true)
        .order("category")
        .order("name");

      if (error) {
        console.error(
          "Erreur chargement tarifs :",
          error
        );
      } else {
        setTarifs((data as Tarif[]) || []);
      }

      setLoading(false);
    }

    chargerTarifs();
  }, []);

  const tarifSelectionne = useMemo(() => {
    return tarifs.find(
      (tarif) => tarif.id === tarifId
    );
  }, [tarifs, tarifId]);

  useEffect(() => {
    if (!tarifSelectionne) {
      setAmount("");
      return;
    }

    const forfait = Number(
      tarifSelectionne.base_price || 0
    );

    const tauxHoraire = Number(
      tarifSelectionne.hourly_rate || 0
    );

    const heures = Number(duree || 0);

    const tauxTVA = Number(
      tarifSelectionne.vat_rate || 0
    );

    const totalHT =
      forfait + tauxHoraire * heures;

    const montantTVA =
      totalHT * (tauxTVA / 100);

    const totalTTC =
      totalHT + montantTVA;

    setAmount(totalTTC.toFixed(2));
  }, [
    tarifSelectionne,
    duree,
    setAmount,
  ]);

  // Proposition automatique basée sur le texte du problème.
  // Elle utilise uniquement les tarifs enregistrés par l'artisan.
  useEffect(() => {
    if (!problem.trim() || tarifId || tarifs.length === 0) {
      return;
    }

    const texte =
      problem.toLowerCase();

    const correspondance = tarifs.find(
      (tarif) =>
        texte.includes(
          tarif.name.toLowerCase()
        ) ||
        texte.includes(
          tarif.category.toLowerCase()
        )
    );

    if (correspondance) {
      setTarifId(correspondance.id);
    }
  }, [problem, tarifs, tarifId]);

  const forfait = Number(
    tarifSelectionne?.base_price || 0
  );

  const tauxHoraire = Number(
    tarifSelectionne?.hourly_rate || 0
  );

  const heures = Number(duree || 0);

  const tauxTVA = Number(
    tarifSelectionne?.vat_rate || 0
  );

  const totalHT =
    forfait + tauxHoraire * heures;

  const montantTVA =
    totalHT * (tauxTVA / 100);

  return (
    <div
      style={{
        marginTop: "18px",
        padding: "18px",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        background: "#f8fafc",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "16px",
          color: "#0f172a",
        }}
      >
        💶 Estimation tarifaire
      </h3>

      {loading ? (
        <p style={{ color: "#64748b" }}>
          Chargement de vos tarifs...
        </p>
      ) : tarifs.length === 0 ? (
        <p
          style={{
            color: "#b45309",
            marginBottom: "15px",
          }}
        >
          Aucun tarif configuré. Ajoutez vos
          prestations dans « Mes tarifs ».
        </p>
      ) : (
        <>
          <label style={labelStyle}>
            Prestation

            <select
              value={tarifId}
              onChange={(e) =>
                setTarifId(e.target.value)
              }
              style={fieldStyle}
            >
              <option value="">
                Sélectionner une prestation
              </option>

              {tarifs.map((tarif) => (
                <option
                  key={tarif.id}
                  value={tarif.id}
                >
                  {tarif.category} —{" "}
                  {tarif.name}
                </option>
              ))}
            </select>
          </label>

          {tarifSelectionne && (
            <>
              <label style={labelStyle}>
                Durée estimée (heures)

                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={duree}
                  onChange={(e) =>
                    setDuree(e.target.value)
                  }
                  style={fieldStyle}
                />
              </label>

              <div
                style={{
                  marginTop: "16px",
                  background: "white",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <LigneCalcul
                  label="Forfait de base"
                  value={forfait}
                />

                <LigneCalcul
                  label={`${heures} h × ${tauxHoraire.toFixed(
                    2
                  )} €`}
                  value={
                    heures * tauxHoraire
                  }
                />

                <LigneCalcul
                  label="Total HT"
                  value={totalHT}
                  strong
                />

                <LigneCalcul
                  label={`TVA (${tauxTVA} %)`}
                  value={montantTVA}
                />

                <div
                  style={{
                    borderTop:
                      "1px solid #e2e8f0",
                    marginTop: "12px",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                  }}
                >
                  <strong>
                    Total estimé TTC
                  </strong>

                  <strong
                    style={{
                      fontSize: "22px",
                      color: "#2563eb",
                    }}
                  >
                    {Number(
                      amount || 0
                    ).toLocaleString(
                      "fr-FR",
                      {
                        style: "currency",
                        currency: "EUR",
                      }
                    )}
                  </strong>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <label
        style={{
          ...labelStyle,
          marginTop: "18px",
        }}
      >
        Paiement

        <select
          value={paymentStatus}
          onChange={(e) =>
            setPaymentStatus(
              e.target.value
            )
          }
          style={fieldStyle}
        >
          <option value="non_paye">
            💸 Non payé
          </option>

          <option value="paye">
            ✅ Payé
          </option>
        </select>
      </label>
    </div>
  );
}

function LigneCalcul({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "9px",
        color: strong
          ? "#0f172a"
          : "#64748b",
        fontWeight: strong ? 800 : 500,
      }}
    >
      <span>{label}</span>

      <span>
        {value.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        })}
      </span>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "14px",
  color: "#475569",
  fontWeight: 700,
};

const fieldStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: "7px",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  background: "white",
  boxSizing: "border-box",
  fontSize: "15px",
};