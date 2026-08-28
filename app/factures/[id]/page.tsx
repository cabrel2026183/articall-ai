"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import MainLayout from "../../../components/MainLayout";
import DocumentActions from "../../../components/documents/DocumentActions";
import { supabase } from "../../../lib/supabase";
import type { Invoice, InvoiceItem, PaymentStatus } from "../../../lib/types";

type InvoiceItemRow = Pick<
  InvoiceItem,
  | "id"
  | "description"
  | "quantity"
  | "unit_price"
  | "vat_rate"
  | "line_subtotal"
  | "vat_amount"
  | "line_total"
  | "position"
>;

export default function FactureDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const factureRef = useRef<HTMLDivElement | null>(null);
  const [telechargement, setTelechargement] = useState(false);
  const [facture, setFacture] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItemRow[]>([]);
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [miseAJourPaiement, setMiseAJourPaiement] = useState(false);
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

    await chargerFacture();
  }

  async function chargerFacture() {
    setLoading(true);
    setErreur("");

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle<Invoice>();

    if (error) {
      setErreur(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setErreur("Cette facture est introuvable.");
      setLoading(false);
      return;
    }

    let factureActuelle = data;

    // Générer un numéro si la facture n'en possède pas encore
    if (!data.invoice_number) {
      const maintenant = new Date();

      const numeroFacture = `FAC-${maintenant.getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const { data: factureMiseAJour, error: updateError } =
        await supabase
          .from("invoices")
          .update({
            invoice_number: numeroFacture,
          })
          .eq("id", data.id)
          .select("*")
          .maybeSingle<Invoice>();

      if (updateError) {
        console.error(
          "Erreur génération numéro facture :",
          updateError
        );

        setErreur(updateError.message);
        setLoading(false);
        return;
      }

      if (factureMiseAJour) {
        factureActuelle = factureMiseAJour;
      }
    }

    setFacture(factureActuelle);

    const { data: itemsData, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("position", { ascending: true });

    if (itemsError) {
      console.error(
        "Erreur chargement des prestations de la facture :",
        itemsError
      );
    } else {
      setItems((itemsData as InvoiceItemRow[]) ?? []);
    }

    if (factureActuelle.quote_id) {
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("quote_number")
        .eq("id", factureActuelle.quote_id)
        .maybeSingle<{ quote_number: string | null }>();

      if (quoteError) {
        console.error(
          "Erreur chargement devis d'origine :",
          quoteError
        );
      } else {
        setQuoteNumber(quoteData?.quote_number || null);
      }
    }

    setLoading(false);
  }

  verifierAccesEtCharger();
}, [id]);

  async function changerStatutPaiement() {
    if (!facture) return;

    setMiseAJourPaiement(true);
    setErreur("");

    const nouveauStatut: PaymentStatus =
      facture.status === "paye" ? "non_paye" : "paye";

    const { error } = await supabase
      .from("invoices")
      .update({
        status: nouveauStatut,
        paid_at: nouveauStatut === "paye" ? new Date().toISOString() : null,
      })
      .eq("id", facture.id);

    if (error) {
      setErreur(error.message);
      setMiseAJourPaiement(false);
      return;
    }

    setFacture({
      ...facture,
      status: nouveauStatut,
    });

    setMiseAJourPaiement(false);
    
  }

  async function telechargerPDF() {
  if (!facture) {
    alert("Aucune facture à télécharger.");
    return;
  }

  if (!factureRef.current) {
    alert("Le document de la facture est introuvable.");
    return;
  }

  try {
    setTelechargement(true);

    const html2canvasModule = await import("html2canvas");
    const jsPDFModule = await import("jspdf");

    const html2canvas = html2canvasModule.default;
    const jsPDF = jsPDFModule.default;

    const canvas = await html2canvas(
      factureRef.current,
      {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true,
        windowWidth:
          factureRef.current.scrollWidth,
        windowHeight:
          factureRef.current.scrollHeight,
      }
    );

    if (!canvas.width || !canvas.height) {
      throw new Error(
        "La capture de la facture est vide."
      );
    }

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.95
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const largeurPage =
      pdf.internal.pageSize.getWidth();

    const hauteurPage =
      pdf.internal.pageSize.getHeight();

    const marge = 8;
    const largeurDisponible =
      largeurPage - marge * 2;

    const hauteurImage =
      (canvas.height * largeurDisponible) /
      canvas.width;

    let positionY = marge;
    let hauteurRestante = hauteurImage;

    pdf.addImage(
      imageData,
      "JPEG",
      marge,
      positionY,
      largeurDisponible,
      hauteurImage
    );

    hauteurRestante -=
      hauteurPage - marge * 2;

    while (hauteurRestante > 0) {
      pdf.addPage();

      positionY =
        marge -
        (hauteurImage - hauteurRestante);

      pdf.addImage(
        imageData,
        "JPEG",
        marge,
        positionY,
        largeurDisponible,
        hauteurImage
      );

      hauteurRestante -=
        hauteurPage - marge * 2;
    }

    const numeroFacture =
      facture.invoice_number ||
      `FAC-${facture.id.slice(0, 8)}`;

    pdf.save(`${numeroFacture}.pdf`);
  } catch (error) {
    console.error(
      "ERREUR TÉLÉCHARGEMENT PDF :",
      error
    );

    alert(
      error instanceof Error
        ? `Impossible de télécharger le PDF : ${error.message}`
        : "Impossible de télécharger le PDF."
    );
  } finally {
    setTelechargement(false);
  }
}

  function formatCurrency(value: number | null | undefined) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value || 0));
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "Non renseignée";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  function formatQuantite(value: number | null | undefined) {
    const nombre = Number(value ?? 0);

    return Number.isInteger(nombre)
      ? nombre.toString()
      : nombre.toLocaleString("fr-FR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        });
  }

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: "40px" }}>
          Chargement de la facture...
        </div>
      </MainLayout>
    );
  }

  if (erreur || !facture) {
    return (
      <MainLayout>
        <div style={{ padding: "40px" }}>
          <p style={{ color: "#b91c1c" }}>
            {erreur || "Facture introuvable."}
          </p>
          <Link href="/factures">Retour aux factures</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <style jsx global>{`
        @media print {
          .facture-no-print {
            display: none !important;
          }

          aside {
            display: none !important;
          }

          header:not(.facture-header) {
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

          .facture-page {
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .facture-document {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .facture-contenu {
            padding: 16px 20px !important;
          }

          .facture-section,
          .facture-header,
          .facture-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .facture-document {
            page-break-after: auto;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        className="facture-page"
        style={{
          minHeight: "100vh",
          backgroundColor: "#f1f5f9",
          padding: "40px 20px",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "13px",
          lineHeight: 1.4,
          color: "#0f172a",
        }}
      >

<DocumentActions
  retourHref="/factures"
  paiementLabel={
    miseAJourPaiement
      ? "Mise à jour..."
      : facture.status === "paye"
        ? "↩ Marquer non payée"
        : "✓ Marquer comme payée"
  }
  paiementDisabled={miseAJourPaiement}
  telechargement={telechargement}
  onPaiement={changerStatutPaiement}
  onTelecharger={telechargerPDF}
  onImprimer={() => window.print()}
/>

       <div
  ref={factureRef}
  className="facture-document"
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            backgroundColor: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.10)",
          }}
        >
          <header
            className="facture-header"
            style={{
              padding: "22px 26px",
              background: "linear-gradient(135deg, #0f172a, #2563eb)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: "white",
                    color: "#2563eb",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "16px",
                    fontWeight: "900",
                  }}
                >
                  A
                </div>

                <div>
                  <strong style={{ display: "block", fontSize: "16px" }}>
                    ArtiCall AI
                  </strong>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>
                    Gestion professionnelle des artisans
                  </span>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  opacity: 0.8,
                }}
              >
                FACTURE
              </p>

              <h1 style={{ margin: "6px 0 8px", fontSize: "24px" }}>
                {facture.invoice_number || "Sans numéro"}
              </h1>

              <span style={{ fontSize: "12px", opacity: 0.9 }}>
                Créée le {formatDate(facture.created_at)}
              </span>
              {facture.due_date && (
                <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "2px" }}>
                  Échéance : {formatDate(facture.due_date)}
                </div>
              )}
              {quoteNumber && (
  <div
    style={{
      marginTop: "6px",
      fontSize: "12px",
      opacity: 0.9,
    }}
  >
    Devis d'origine :{" "}
    <Link
      href={`/devis/${facture.quote_id}`}
      style={{
        color: "inherit",
        fontWeight: "800",
        textDecoration: "underline",
      }}
    >
      {quoteNumber}
    </Link>
  </div>
)}
            </div>

          </header>

          <div className="facture-contenu" style={{ padding: "20px 26px" }}>
            <section
              className="facture-section"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <InformationCard
                titre="Émetteur"
                fond="#f8fafc"
                bordure="#e2e8f0"
              >
                <h2 style={{ margin: "0 0 6px", fontSize: "15px" }}>ArtiCall AI</h2>
                <p style={texteSecondaire}>Votre nom d’entreprise</p>
                <p style={texteSecondaire}>Votre adresse</p>
                <p style={texteSecondaire}>contact@votreentreprise.fr</p>
              </InformationCard>

              <InformationCard
                titre="Facturé à"
                fond="#eff6ff"
                bordure="#bfdbfe"
              >
                <h2 style={{ margin: "0 0 6px", fontSize: "15px" }}>
                  {facture.customer_name || "Client"}
                </h2>
                <p style={{ margin: "3px 0" }}>
                  {facture.customer_email || "Email non renseigné"}
                </p>
                <p style={{ margin: "3px 0" }}>
                  {facture.customer_phone || "Téléphone non renseigné"}
                </p>
                <p style={{ margin: "3px 0" }}>
                  {facture.customer_address || "Adresse non renseignée"}
                </p>
              </InformationCard>
            </section>

            <section
              className="facture-section"
              style={{ marginBottom: "20px" }}
            >
              <h2 style={{ marginBottom: "10px", fontSize: "16px" }}>
                Détail des prestations
              </h2>

              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 100px 110px",
                    gap: "10px",
                    padding: "10px 14px",
                    backgroundColor: "#0f172a",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  <span>Prestation</span>
                  <span style={{ textAlign: "right" }}>Qté</span>
                  <span style={{ textAlign: "right" }}>Prix U. HT</span>
                  <span style={{ textAlign: "right" }}>Total HT</span>
                </div>

                {items.length === 0 ? (
                  <div
                    style={{
                      padding: "16px 14px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Aucune prestation détaillée pour cette facture.
                  </div>
                ) : (
                  items.map((item, index) => {
                    const quantite = Number(item.quantity ?? 0);
                    const prixUnitaire = Number(item.unit_price ?? 0);
                    const totalLigneHT =
                      item.line_subtotal ?? quantite * prixUnitaire;

                    return (
                      <div
                        key={item.id ?? index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 70px 100px 110px",
                          gap: "10px",
                          padding: "10px 14px",
                          alignItems: "center",
                          borderTop:
                            index === 0 ? "none" : "1px solid #e2e8f0",
                        }}
                      >
                        <span>
                          {item.description || "Prestation non renseignée"}
                        </span>
                        <span style={{ textAlign: "right" }}>
                          {formatQuantite(quantite)}
                        </span>
                        <span style={{ textAlign: "right" }}>
                          {formatCurrency(prixUnitaire)}
                        </span>
                        <strong style={{ textAlign: "right" }}>
                          {formatCurrency(totalLigneHT)}
                        </strong>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section
              className="facture-section"
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "6px",
                  }}
                >
                  <span>Sous-total HT</span>
                  <span>{formatCurrency(facture.subtotal)}</span>
                </div>

                {Number(facture.discount_amount ?? 0) > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      marginBottom: "6px",
                      color: "#b91c1c",
                    }}
                  >
                    <span>Remise</span>
                    <span>
                      − {formatCurrency(facture.discount_amount)}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    TVA
                    {facture.tax_rate !== null &&
                    facture.tax_rate !== undefined
                      ? ` (${facture.tax_rate}%)`
                      : ""}
                  </span>
                  <span>{formatCurrency(facture.tax_amount)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    paddingTop: "10px",
                    borderTop: "1px solid #cbd5e1",
                  }}
                >
                  <span style={{ fontSize: "15px", fontWeight: "900" }}>
                    Total TTC
                  </span>

                  <span
                    style={{
                      fontSize: "20px",
                      color: "#2563eb",
                      fontWeight: "900",
                    }}
                  >
                    {formatCurrency(facture.total_amount)}
                  </span>
                </div>
              </div>
            </section>

            <footer
              className="facture-footer"
              style={{
                marginTop: "22px",
                paddingTop: "14px",
                borderTop: "1px solid #e2e8f0",
                textAlign: "center",
                color: "#64748b",
                fontSize: "11px",
              }}
            >
              <p style={{ margin: "3px 0" }}>
                Merci pour votre confiance.
              </p>
              <p style={{ margin: "8px 0 0" }}>
                Facture générée avec ArtiCall AI
              </p>
            </footer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function InformationCard({
  titre,
  fond,
  bordure,
  children,
}: {
  titre: string;
  fond: string;
  bordure: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "12px",
        backgroundColor: fond,
        border: `1px solid ${bordure}`,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#2563eb",
          fontSize: "11px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {titre}
      </p>

      {children}
    </div>
  );
}

const texteSecondaire: React.CSSProperties = {
  margin: "3px 0",
  color: "#64748b",
};