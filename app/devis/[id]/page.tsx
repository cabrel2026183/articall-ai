"use client";

import Link from "next/link";
import MainLayout from "../../../components/MainLayout";
import DocumentActions from "../../../components/documents/DocumentActions";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  Quote,
  QuoteStatus,
  AuthUser,
} from "../../../lib/types";

type QuoteRow = Pick<
  Quote,
  | "id"
  | "call_id"
  | "company_id"
  | "quote_number"
  | "client_name"
  | "client_email"
  | "client_phone"
  | "address"
  | "status"
  | "notes"
  | "subtotal"
  | "vat_rate"
  | "vat_amount"
  | "discount"
  | "total"
  | "created_at"
  | "valid_until"
>;

type QuoteItem = {
  id: string;
  quote_id?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  vat_rate?: number | null;
  line_subtotal?: number | null;
  vat_amount?: number | null;
  line_total?: number | null;
  position?: number | null;
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0));

const formatDate = (value?: string | null) => {
  if (!value) return "Non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const getStatusLabel = (status?: QuoteStatus | null) => {
  switch (status) {
    case "draft":
      return "Brouillon";
    case "sent":
      return "Envoyé";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refusé";
    case "expired":
      return "Expiré";
    default:
      return "Brouillon";
  }
};

const getStatusStyle = (
  status?: QuoteStatus | null
): React.CSSProperties => {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 12px",
    borderRadius: "999px",
    fontSize: "14px",
    fontWeight: 800,
  };

  switch (status) {
    case "sent":
      return { ...base, background: "#dbeafe", color: "#1d4ed8" };
    case "accepted":
      return { ...base, background: "#dcfce7", color: "#15803d" };
    case "refused":
      return { ...base, background: "#fee2e2", color: "#b91c1c" };
    case "expired":
      return { ...base, background: "#fef3c7", color: "#b45309" };
    default:
      return { ...base, background: "#f1f5f9", color: "#475569" };
  }
};

export default function QuoteDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const devisRef = useRef<HTMLDivElement | null>(null);

  const quoteId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [quote, setQuote] = useState<QuoteRow | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [telechargement, setTelechargement] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    async function chargerSession() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        window.location.href = "/login";
        return;
      }

      setUser(currentUser);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Erreur chargement du rôle :", profileError);
      }

      const roleFinal = profile?.role || "technicien";

      if (roleFinal !== "admin") {
        window.location.href = "/";
        return;
      }

      setRole(roleFinal);
    }

    chargerSession();
  }, []);

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    if (!quoteId) return;

    setLoading(true);
    setError("");

    const { data: quoteData, error: quoteError } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .maybeSingle();

    if (quoteError) {
      setError(`Erreur Supabase : ${quoteError.message}`);
      setLoading(false);
      return;
    }

    if (!quoteData) {
      setError("Devis introuvable.");
      setLoading(false);
      return;
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("quote_items")
      .select("*")
      .eq("quote_id", quoteId)
      .order("position", { ascending: true });

    if (itemsError) {
      setError(
        `Le devis existe, mais ses prestations ne peuvent pas être chargées : ${itemsError.message}`
      );
      setQuote(quoteData as QuoteRow);
      setLoading(false);
      return;
    }

    setQuote(quoteData as QuoteRow);
    setItems((itemsData as QuoteItem[]) ?? []);
    setLoading(false);
  };

  const calculatedSubtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unit_price ?? 0);
      const lineSubtotal =
        item.line_subtotal !== null && item.line_subtotal !== undefined
          ? Number(item.line_subtotal)
          : quantity * unitPrice;

      return sum + lineSubtotal;
    }, 0);
  }, [items]);

  const calculatedTaxAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.vat_amount !== null && item.vat_amount !== undefined) {
        return sum + Number(item.vat_amount);
      }

      const quantity = Number(item.quantity ?? 0);
      const unitPrice = Number(item.unit_price ?? 0);
      const vatRate = Number(item.vat_rate ?? quote?.vat_rate ?? 0);
      const lineSubtotal = quantity * unitPrice;

      return sum + lineSubtotal * (vatRate / 100);
    }, 0);
  }, [items, quote?.vat_rate]);

  const discountAmount = Number(quote?.discount ?? 0);

  const finalTotal = Math.max(
    0,
    calculatedSubtotal + calculatedTaxAmount - discountAmount
  );

  const updateStatus = async (newStatus: QuoteStatus) => {
    if (!quoteId) return;

    setSavingStatus(true);
    setError("");

    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: newStatus })
      .eq("id", quoteId);

    if (updateError) {
      setError(`Erreur Supabase : ${updateError.message}`);
      setSavingStatus(false);
      return;
    }

    setQuote((currentQuote) =>
      currentQuote ? { ...currentQuote, status: newStatus } : currentQuote
    );

    setSavingStatus(false);
  };

  const deleteQuote = async () => {
    if (!quoteId || deleting) return;

    if (
      !window.confirm(
        "Voulez-vous vraiment supprimer ce devis ? Cette action est définitive."
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");

    const { error: itemsDeleteError } = await supabase
      .from("quote_items")
      .delete()
      .eq("quote_id", quoteId);

    if (itemsDeleteError) {
      setError(
        `Impossible de supprimer les prestations : ${itemsDeleteError.message}`
      );
      setDeleting(false);
      return;
    }

    const { error: quoteDeleteError } = await supabase
      .from("quotes")
      .delete()
      .eq("id", quoteId);

    if (quoteDeleteError) {
      setError(`Impossible de supprimer le devis : ${quoteDeleteError.message}`);
      setDeleting(false);
      return;
    }

    router.push("/devis");
    router.refresh();
  };

  const convertToInvoice = async () => {
    if (!quote || converting) return;

    if (!window.confirm("Voulez-vous transformer ce devis en facture ?")) {
      return;
    }

    setConverting(true);
    setError("");

    try {
      const invoiceNumber = `FAC-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const invoicePayload = {
        quote_id: quote.id,
        invoice_number: invoiceNumber,
        customer_name: quote.client_name || null,
        customer_email: quote.client_email || null,
        customer_phone: quote.client_phone || null,
        customer_address: quote.address || null,
        subtotal: Number(calculatedSubtotal),
        tax_rate: quote.vat_rate ?? null,
        tax_amount: Number(calculatedTaxAmount),
        discount_amount: Number(discountAmount),
        total_amount: Number(finalTotal),
        status: "non_paye",
        company_id: quote.company_id || null,
      };

      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoicePayload)
        .select("id")
        .maybeSingle();

      if (invoiceError || !invoiceData) {
        setError(
          `Impossible de créer la facture : ${
            invoiceError?.message ?? "Erreur inconnue"
          }`
        );
        setConverting(false);
        return;
      }

      // On reprend les lignes du devis telles quelles pour la facture
      const invoiceItemsPayload = items.map((item, index) => ({
        invoice_id: invoiceData.id,
        description: item.description || "Prestation",
        quantity: Number(item.quantity ?? 1),
        unit_price: Number(item.unit_price ?? 0),
        vat_rate: item.vat_rate ?? quote.vat_rate ?? null,
        line_subtotal: item.line_subtotal ?? null,
        vat_amount: item.vat_amount ?? null,
        line_total: item.line_total ?? null,
        position: item.position ?? index,
      }));

      if (invoiceItemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(invoiceItemsPayload);

        if (itemsError) {
          // La facture existe déjà mais sans ses lignes : on la supprime
          // pour ne pas laisser une facture vide et incohérente.
          await supabase.from("invoices").delete().eq("id", invoiceData.id);

          setError(
            `Impossible d'enregistrer les prestations de la facture : ${itemsError.message}`
          );
          setConverting(false);
          return;
        }
      }

      await supabase
        .from("quotes")
        .update({ status: "accepted" })
        .eq("id", quote.id);

      router.push(`/factures/${invoiceData.id}`);
      router.refresh();
    } catch (conversionError) {
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : "Impossible de transformer le devis en facture."
      );
      setConverting(false);
    }
  };

  const telechargerPDF = async () => {
    if (!devisRef.current || !quote) return;

    try {
      setTelechargement(true);

      const html2canvasModule = await import("html2canvas");
      const jsPDFModule = await import("jspdf");

      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.default;

      const canvas = await html2canvas(devisRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let remainingHeight = imageHeight;
      let positionY = margin;

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        positionY,
        imageWidth,
        imageHeight
      );

      remainingHeight -= pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();
        positionY = margin - (imageHeight - remainingHeight);

        pdf.addImage(
          imageData,
          "JPEG",
          margin,
          positionY,
          imageWidth,
          imageHeight
        );

        remainingHeight -= pageHeight - margin * 2;
      }

      const numero = quote.quote_number || `DEV-${quote.id.slice(0, 8)}`;
      pdf.save(`${numero}.pdf`);
    } catch (pdfError) {
      alert(
        pdfError instanceof Error
          ? `Impossible de télécharger le PDF : ${pdfError.message}`
          : "Impossible de télécharger le PDF."
      );
    } finally {
      setTelechargement(false);
    }
  };

  if (loading) {
    return (
      <MainLayout user={user} role={role}>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <p style={{ color: "#64748b" }}>Chargement du devis...</p>
        </div>
      </MainLayout>
    );
  }

  if (error && !quote) {
    return (
      <MainLayout user={user} role={role}>
        <div
          style={{
            padding: "32px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <Link
            href="/devis"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Retour aux devis
          </Link>

          <div
            style={{
              marginTop: "24px",
              padding: "18px",
              borderRadius: "12px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!quote) {
    return (
      <MainLayout user={user} role={role}>
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h1>Devis introuvable</h1>
          <Link href="/devis">Retour à la liste des devis</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="devis-screen-layout">
      <MainLayout user={user} role={role}>
      <style jsx global>{`
        @media print {
          .devis-screen-layout > div > aside {
            display: none !important;
          }

          .devis-screen-layout > div > div > header {
            display: none !important;
          }

          .devis-screen-layout > div,
          .devis-screen-layout > div > div {
            display: block !important;
            min-height: 0 !important;
            background: white !important;
          }

          .devis-screen-layout > div > div > main {
            padding: 0 !important;
          }

          .document-no-print {
            display: none !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .devis-page {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .devis-document {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        className="devis-page"
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: "36px 20px 50px",
        }}
      >
        <DocumentActions
          retourHref="/devis"
          telechargement={telechargement}
          onTelecharger={telechargerPDF}
          onImprimer={() => window.print()}
        />

        <div
          className="document-no-print"
          style={{
            maxWidth: "1000px",
            margin: "0 auto 18px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/devis/${quote.id}/modifier`}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              background: "white",
              border: "1px solid #cbd5e1",
              color: "#334155",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ✏️ Modifier
          </Link>

          <button
            type="button"
            onClick={convertToInvoice}
            disabled={converting}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: converting ? "not-allowed" : "pointer",
              opacity: converting ? 0.65 : 1,
            }}
          >
            {converting ? "Création..." : "🧾 Transformer en facture"}
          </button>

          <button
            type="button"
            onClick={deleteQuote}
            disabled={deleting}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "none",
              background: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.65 : 1,
            }}
          >
            {deleting ? "Suppression..." : "🗑️ Supprimer"}
          </button>
        </div>

        {error && (
          <div
            className="document-no-print"
            style={{
              maxWidth: "1000px",
              margin: "0 auto 18px",
              padding: "15px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        <div
          ref={devisRef}
          className="devis-document"
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.10)",
          }}
        >
          <header
            style={{
              padding: "34px",
              background: "linear-gradient(135deg, #0f172a, #2563eb)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "13px",
                    background: "white",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "20px",
                  }}
                >
                  A
                </div>

                <div>
                  <strong style={{ display: "block", fontSize: "21px" }}>
                    ArtiCall AI
                  </strong>
                  <span style={{ fontSize: "13px", opacity: 0.8 }}>
                    Gestion professionnelle des artisans
                  </span>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  opacity: 0.8,
                }}
              >
                DEVIS
              </p>

              <h1 style={{ margin: "8px 0 10px", fontSize: "34px" }}>
  {quote.quote_number || "Devis"}
</h1>

{quote.call_id && (
  <div
    style={{
      marginTop: "8px",
      fontSize: "14px",
      color: "#64748b",
    }}
  >
    Intervention d'origine :{" "}
    <Link
      href={`/interventions/${quote.call_id}`}
      style={{
        color: "#2563eb",
        fontWeight: 800,
        textDecoration: "none",
      }}
    >
      Voir la fiche
    </Link>
  </div>
)}

              <span style={{ fontSize: "14px", opacity: 0.9 }}>
                Créé le {formatDate(quote.created_at)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "12px",
              }}
            >
              <span style={getStatusStyle(quote.status)}>
                {getStatusLabel(quote.status)}
              </span>

              <span style={{ fontSize: "14px", opacity: 0.9 }}>
                Valable jusqu’au {formatDate(quote.valid_until)}
              </span>
            </div>
          </header>

          <div style={{ padding: "34px" }}>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              <DocumentCard
                label="Émetteur"
                background="#f8fafc"
                border="#e2e8f0"
              >
                <h2 style={{ margin: "0 0 10px" }}>ArtiCall AI</h2>
                <p style={secondaryText}>Votre nom d’entreprise</p>
                <p style={secondaryText}>Votre adresse</p>
                <p style={secondaryText}>contact@votreentreprise.fr</p>
              </DocumentCard>

              <DocumentCard
                label="Client"
                background="#eff6ff"
                border="#bfdbfe"
              >
                <h2 style={{ margin: "0 0 10px" }}>
                  {quote.client_name || "Client non renseigné"}
                </h2>
                <p style={{ margin: "5px 0" }}>
                  {quote.client_email || "Email non renseigné"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  {quote.client_phone || "Téléphone non renseigné"}
                </p>
                <p style={{ margin: "5px 0" }}>
                  {quote.address || "Adresse non renseignée"}
                </p>
              </DocumentCard>
            </section>

            <section style={{ marginBottom: "30px" }}>
              <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>
                Prestations
              </h2>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#0f172a",
                        color: "white",
                        textAlign: "left",
                      }}
                    >
                      <DocumentTh>Description</DocumentTh>
                      <DocumentTh>Quantité</DocumentTh>
                      <DocumentTh>Prix unitaire HT</DocumentTh>
                      <DocumentTh>Total TTC</DocumentTh>
                    </tr>
                  </thead>

                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          Aucune prestation enregistrée.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const quantity = Number(item.quantity ?? 0);
                        const unitPrice = Number(item.unit_price ?? 0);
                        const vatRate = Number(
                          item.vat_rate ?? quote.vat_rate ?? 0
                        );

                        const subtotal =
                          item.line_subtotal !== null &&
                          item.line_subtotal !== undefined
                            ? Number(item.line_subtotal)
                            : quantity * unitPrice;

                        const vat =
                          item.vat_amount !== null &&
                          item.vat_amount !== undefined
                            ? Number(item.vat_amount)
                            : subtotal * (vatRate / 100);

                        const lineTotal =
                          item.line_total !== null &&
                          item.line_total !== undefined
                            ? Number(item.line_total)
                            : subtotal + vat;

                        return (
                          <tr
                            key={item.id}
                            style={{ borderTop: "1px solid #e2e8f0" }}
                          >
                            <DocumentTd>
                              {item.description || "Prestation sans description"}
                            </DocumentTd>
                            <DocumentTd>{quantity}</DocumentTd>
                            <DocumentTd>{formatCurrency(unitPrice)}</DocumentTd>
                            <DocumentTd>
                              <strong>{formatCurrency(lineTotal)}</strong>
                            </DocumentTd>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) minmax(280px, 380px)",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  padding: "22px",
                  borderRadius: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h2 style={{ margin: "0 0 14px", fontSize: "18px" }}>
                  📝 Notes
                </h2>

                <p
                  style={{
                    margin: 0,
                    color: quote.notes ? "#334155" : "#94a3b8",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {quote.notes || "Aucune note ajoutée."}
                </p>
              </div>

              <div
                style={{
                  padding: "22px",
                  borderRadius: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <AmountLine
                  label="Sous-total HT"
                  value={formatCurrency(calculatedSubtotal)}
                />

                <AmountLine
                  label={`TVA ${
                    quote.vat_rate !== null && quote.vat_rate !== undefined
                      ? `(${quote.vat_rate} %)`
                      : ""
                  }`}
                  value={formatCurrency(calculatedTaxAmount)}
                />

                <AmountLine
                  label="Remise"
                  value={`- ${formatCurrency(discountAmount)}`}
                />

                <div
                  style={{
                    height: "1px",
                    background: "#e2e8f0",
                    margin: "16px 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ color: "#0f172a", fontSize: "18px" }}>
                    Total TTC
                  </strong>

                  <strong style={{ color: "#2563eb", fontSize: "25px" }}>
                    {formatCurrency(finalTotal)}
                  </strong>
                </div>
              </div>
            </section>

            <footer
              style={{
                marginTop: "38px",
                paddingTop: "22px",
                borderTop: "1px solid #e2e8f0",
                textAlign: "center",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              <p style={{ margin: "5px 0" }}>Merci pour votre confiance.</p>
              <p style={{ margin: "12px 0 0" }}>
                Devis généré avec ArtiCall AI
              </p>
            </footer>
          </div>
        </div>

        <section
          className="document-no-print"
          style={{
            maxWidth: "1000px",
            margin: "22px auto 0",
            padding: "20px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#0f172a",
              fontSize: "20px",
            }}
          >
            Mettre à jour le statut
          </h2>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <StatusButton
              label="Brouillon"
              active={quote.status === "draft" || !quote.status}
              disabled={savingStatus}
              onClick={() => updateStatus("draft")}
            />

            <StatusButton
              label="Envoyé"
              active={quote.status === "sent"}
              disabled={savingStatus}
              onClick={() => updateStatus("sent")}
            />

            <StatusButton
              label="Accepté"
              active={quote.status === "accepted"}
              disabled={savingStatus}
              onClick={() => updateStatus("accepted")}
            />

            <StatusButton
              label="Refusé"
              active={quote.status === "refused"}
              disabled={savingStatus}
              onClick={() => updateStatus("refused")}
            />
          </div>

          {savingStatus && (
            <p style={{ color: "#64748b" }}>
              Mise à jour du statut...
            </p>
          )}
        </section>
      </div>
      </MainLayout>
    </div>
  );
}

function DocumentCard({
  label,
  background,
  border,
  children,
}: {
  label: string;
  background: string;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "22px",
        borderRadius: "16px",
        background,
        border: `1px solid ${border}`,
      }}
    >
      <p
        style={{
          margin: "0 0 14px",
          color: "#2563eb",
          fontSize: "13px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </p>

      {children}
    </div>
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
        gap: "20px",
        marginBottom: "12px",
        color: "#475569",
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DocumentTh({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        padding: "14px 18px",
        fontSize: "13px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </th>
  );
}

function DocumentTd({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td
      style={{
        padding: "16px 18px",
        color: "#475569",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function StatusButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "10px 15px",
        borderRadius: "10px",
        border: active
          ? "1px solid #2563eb"
          : "1px solid #cbd5e1",
        background: active ? "#eff6ff" : "white",
        color: active ? "#1d4ed8" : "#475569",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
      }}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}

const secondaryText: React.CSSProperties = {
  margin: "5px 0",
  color: "#64748b",
};