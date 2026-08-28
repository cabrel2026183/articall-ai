"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import type {
  Quote,
  QuoteItem,
  QuoteStatus,
} from "../../../../lib/types";

type QuoteFormData = Pick<
  Quote,
  | "id"
  | "quote_number"
  | "client_name"
  | "client_email"
  | "client_phone"
  | "status"
  | "notes"
  | "vat_rate"
  | "discount"
  | "valid_until"
>;

export default function ModifierDevisPage() {
  const params = useParams();
  const router = useRouter();

  const quoteId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [quoteNumber, setQuoteNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [status, setStatus] = useState<QuoteStatus>("draft");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(20);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validUntil, setValidUntil] = useState("");

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

      if (quoteId) {
        await loadQuote();
      }
    }

    verifierAccesEtCharger();
  }, [quoteId]);

  const loadQuote = async () => {
    if (!quoteId) return;

    setLoading(true);
    setError("");

    const { data: quoteData, error: quoteError } =
      await supabase
        .from("quotes")
        .select("*")
        .eq("id", quoteId)
        .single();

    if (quoteError) {
      console.error(quoteError);
      setError(`Erreur Supabase : ${quoteError.message}`);
      setLoading(false);
      return;
    }

    const { data: itemsData, error: itemsError } =
      await supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", quoteId);

    if (itemsError) {
      console.error(itemsError);
      setError(`Erreur Supabase : ${itemsError.message}`);
      setLoading(false);
      return;
    }

    const quote = quoteData as QuoteFormData;

    setQuoteNumber(quote.quote_number ?? "");
    setCustomerName(quote.client_name ?? "");
    setCustomerEmail(quote.client_email ?? "");
    setCustomerPhone(quote.client_phone ?? "");
    setStatus(quote.status ?? "draft");
    setNotes(quote.notes ?? "");
    setTaxRate(Number(quote.vat_rate ?? 20));
    setDiscountAmount(
      Number(quote.discount ?? 0)
    );

    if (quote.valid_until) {
      setValidUntil(quote.valid_until.slice(0, 10));
    }

    const loadedItems = (itemsData ?? []).map(
      (item: QuoteItem) => ({
        id: item.id,
        quote_id: item.quote_id,
        description: item.description ?? "",
        quantity: Number(item.quantity ?? 1),
        unit_price: Number(item.unit_price ?? 0),
        line_total: Number(
  item.line_total ??
    Number(item.quantity ?? 0) *
      Number(item.unit_price ?? 0)
),
      })
    );

    setItems(
      loadedItems.length > 0
        ? loadedItems
        : [
            {
              description: "",
              quantity: 1,
              unit_price: 0,
            },
          ]
    );

    setLoading(false);
  };

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return (
        total +
        Number(item.quantity || 0) *
          Number(item.unit_price || 0)
      );
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return subtotal * (Number(taxRate || 0) / 100);
  }, [subtotal, taxRate]);

  const totalAmount = useMemo(() => {
    return Math.max(
      0,
      subtotal +
        taxAmount -
        Number(discountAmount || 0)
    );
  }, [subtotal, taxAmount, discountAmount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const updateItem = (
    index: number,
    field: "description" | "quantity" | "unit_price",
    value: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === "description") {
          return {
            ...item,
            description: value,
          };
        }

        return {
          ...item,
          [field]: Number(value),
        };
      })
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      setItems([
        {
          description: "",
          quantity: 1,
          unit_price: 0,
        },
      ]);

      return;
    }

    setItems((currentItems) =>
      currentItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  const saveQuote = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!quoteId || saving) return;

    if (!customerName.trim()) {
      setError("Le nom du client est obligatoire.");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.description.trim() &&
        Number(item.quantity) > 0
    );

    if (validItems.length === 0) {
      setError(
        "Ajoute au moins une prestation avec une description."
      );
      return;
    }

    setSaving(true);
    setError("");

    // 1. Mettre à jour les informations du devis lui-même
    // (jusqu'ici jamais enregistrées : c'était le bug principal)
    const { error: updateQuoteError } = await supabase
      .from("quotes")
      .update({
        client_name: customerName.trim(),
        client_email: customerEmail.trim() || null,
        client_phone: customerPhone.trim() || null,
        status,
        notes: notes.trim() || null,
        vat_rate: Number(taxRate || 0),
        discount: Number(discountAmount || 0),
        valid_until: validUntil || null,
        subtotal,
        total: totalAmount,
      })
      .eq("id", quoteId);

    if (updateQuoteError) {
      console.error(updateQuoteError);
      setError(
        `Impossible d’enregistrer le devis : ${updateQuoteError.message}`
      );
      setSaving(false);
      return;
    }

    // 2. Remplacer les prestations : on supprime les anciennes lignes
    // avant d'insérer les nouvelles, pour éviter les doublons à chaque
    // sauvegarde.
    const { error: deleteItemsError } = await supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", quoteId);

    if (deleteItemsError) {
      console.error(deleteItemsError);
      setError(
        `Le devis a été mis à jour, mais les anciennes prestations n’ont pas pu être retirées : ${deleteItemsError.message}`
      );
      setSaving(false);
      return;
    }

   const itemsPayload = validItems.map((item, index) => {
  const quantity = Number(item.quantity);
  const unitPrice = Number(item.unit_price);
  const lineSubtotal = quantity * unitPrice;

  return {
    quote_id: quoteId,
    description: item.description.trim(),
    quantity,
    unit_price: unitPrice,
    vat_rate: Number(taxRate || 0),
    line_subtotal: lineSubtotal,
    vat_amount: lineSubtotal * (Number(taxRate || 0) / 100),
    line_total:
      lineSubtotal +
      lineSubtotal * (Number(taxRate || 0) / 100),
    position: index + 1,
  };
});

    const { error: insertItemsError } =
      await supabase
        .from("quote_items")
        .insert(itemsPayload);

    if (insertItemsError) {
      console.error(insertItemsError);
      setError(
        `Le devis a été modifié, mais les prestations n’ont pas pu être enregistrées : ${insertItemsError.message}`
      );
      setSaving(false);
      return;
    }

    router.push(`/devis/${quoteId}`);
    router.refresh();
  };

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#64748b" }}>
          Chargement du devis...
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <Link
        href={`/devis/${quoteId}`}
        style={{
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Retour au devis
      </Link>

      <header style={{ margin: "24px 0" }}>
        <h1
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "32px",
          }}
        >
          ✏️ Modifier le devis
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: 0,
          }}
        >
          Modifiez les informations du client, les
          prestations et les montants.
        </p>
      </header>

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "10px",
            background: "#fee2e2",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={saveQuote}>
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
            }}
          >
            Informations du client
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <Field label="Numéro du devis">
              <input
                value={quoteNumber}
                onChange={(event) =>
                  setQuoteNumber(event.target.value)
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Nom du client *">
              <input
                required
                value={customerName}
                onChange={(event) =>
                  setCustomerName(event.target.value)
                }
                style={inputStyle}
              />
            </Field>

            <Field label="E-mail">
              <input
                type="email"
                value={customerEmail}
                onChange={(event) =>
                  setCustomerEmail(event.target.value)
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Téléphone">
              <input
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(event.target.value)
                }
                style={inputStyle}
              />
            </Field>

            
            <Field label="Valable jusqu’au">
              <input
                type="date"
                value={validUntil}
                onChange={(event) =>
                  setValidUntil(event.target.value)
                }
                style={inputStyle}
              />
            </Field>

            <Field label="Statut">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as QuoteStatus
                  )
                }
                style={inputStyle}
              >
                <option value="draft">
                  Brouillon
                </option>
                <option value="sent">Envoyé</option>
                <option value="accepted">
                  Accepté
                </option>
                <option value="refused">
                  Refusé
                </option>
                <option value="expired">
                  Expiré
                </option>
              </select>
            </Field>
          </div>
        </section>

        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow:
              "0 8px 24px rgba(15, 23, 42, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
              }}
            >
              Prestations
            </h2>

            <button
              type="button"
              onClick={addItem}
              style={secondaryButtonStyle}
            >
              + Ajouter une ligne
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {items.map((item, index) => {
              const lineTotal =
                Number(item.quantity || 0) *
                Number(item.unit_price || 0);

              return (
                <div
                  key={item.id ?? index}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(250px, 1fr) 120px 160px 140px 50px",
                    gap: "12px",
                    alignItems: "end",
                    paddingBottom: "14px",
                    borderBottom:
                      "1px solid #e2e8f0",
                    overflowX: "auto",
                  }}
                >
                  <Field label="Description">
                    <input
                      value={item.description}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "description",
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Quantité">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "quantity",
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Prix unitaire HT">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) =>
                        updateItem(
                          index,
                          "unit_price",
                          event.target.value
                        )
                      }
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Total HT">
                    <div
                      style={{
                        minHeight: "44px",
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {formatCurrency(lineTotal)}
                    </div>
                  </Field>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    title="Supprimer cette ligne"
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "none",
                      borderRadius: "10px",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      cursor: "pointer",
                      fontSize: "17px",
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(280px, 380px)",
            gap: "20px",
            marginBottom: "22px",
          }}
        >
          <article
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px",
            }}
          >
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={8}
                style={{
                  ...inputStyle,
                  paddingTop: "12px",
                  resize: "vertical",
                }}
              />
            </Field>
          </article>

          <article
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "18px",
              padding: "24px",
            }}
          >
            <Field label="Taux de TVA (%)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(event) =>
                  setTaxRate(
                    Number(event.target.value)
                  )
                }
                style={inputStyle}
              />
            </Field>

            <div style={{ height: "14px" }} />

            <Field label="Remise (€)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={(event) =>
                  setDiscountAmount(
                    Number(event.target.value)
                  )
                }
                style={inputStyle}
              />
            </Field>

            <div
              style={{
                marginTop: "20px",
                borderTop: "1px solid #e2e8f0",
                paddingTop: "18px",
              }}
            >
              <AmountLine
                label="Sous-total HT"
                value={formatCurrency(subtotal)}
              />

              <AmountLine
                label={`TVA (${taxRate || 0} %)`}
                value={formatCurrency(taxAmount)}
              />

              <AmountLine
                label="Remise"
                value={`- ${formatCurrency(
                  Number(discountAmount || 0)
                )}`}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  marginTop: "18px",
                  fontSize: "20px",
                }}
              >
                <strong>Total TTC</strong>

                <strong style={{ color: "#2563eb" }}>
                  {formatCurrency(totalAmount)}
                </strong>
              </div>
            </div>
          </article>
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/devis/${quoteId}`}
            style={{
              ...secondaryButtonStyle,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Annuler
          </Link>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "white",
              fontWeight: 800,
              cursor: saving
                ? "not-allowed"
                : "pointer",
              opacity: saving ? 0.65 : 1,
            }}
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        color: "#475569",
        fontSize: "14px",
        fontWeight: 700,
      }}
    >
      {label}
      {children}
    </label>
  );
}

function AmountLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        color: "#475569",
        marginBottom: "11px",
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "44px",
  padding: "0 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  background: "white",
  color: "#0f172a",
  fontSize: "15px",
  boxSizing: "border-box",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "11px 16px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};