// API route : envoi d'une facture par email au client, avec la facture
// en pièce jointe PDF.
//
// Appelée depuis app/factures/[id]/page.tsx au clic sur "Envoyer par email".
// Le PDF est généré côté client (html2canvas + jsPDF, qui ont besoin d'un
// DOM navigateur) puis transmis ici en base64 pour être joint à l'email.
// Le reste (montants, coordonnées) est récupéré directement depuis
// Supabase, on ne fait confiance qu'à l'invoiceId transmis, jamais aux
// données envoyées par le client.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, EMAIL_EXPEDITEUR } from "../../../lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const formatMontant = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(valeur);

const formatDate = (valeur: string | null) => {
  if (!valeur) return "Non renseignée";
  const date = new Date(valeur);
  if (Number.isNaN(date.getTime())) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export async function POST(request: Request) {
  try {
    const { invoiceId, pdfBase64, nomFichier } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Identifiant de la facture manquant." },
        { status: 400 }
      );
    }

    const { data: facture, error: factureError } = await supabaseAdmin
      .from("invoices")
      .select(
        "id, invoice_number, customer_name, customer_email, total_amount, due_date"
      )
      .eq("id", invoiceId)
      .maybeSingle();

    if (factureError || !facture) {
      return NextResponse.json(
        { error: factureError?.message || "Facture introuvable." },
        { status: 404 }
      );
    }

    if (!facture.customer_email) {
      return NextResponse.json(
        { error: "Ce client n'a pas d'adresse email renseignée." },
        { status: 400 }
      );
    }

    const { data: items } = await supabaseAdmin
      .from("invoice_items")
      .select("description, quantity, unit_price, line_total")
      .eq("invoice_id", invoiceId)
      .order("position", { ascending: true });

    const { data: entreprise } = await supabaseAdmin
      .from("company_settings")
      .select("company_name, phone, email")
      .limit(1)
      .maybeSingle();

    const nomEntreprise = entreprise?.company_name || "Votre artisan";
    const nomClient = facture.customer_name || "Bonjour";
    const numeroFacture =
      facture.invoice_number || `FAC-${facture.id.slice(0, 8)}`;

    const lignesHtml = (items || [])
      .map((item) => {
        const quantite = Number(item.quantity ?? 0);
        const prixUnitaire = Number(item.unit_price ?? 0);
        const totalLigne =
          item.line_total !== null && item.line_total !== undefined
            ? Number(item.line_total)
            : quantite * prixUnitaire;

        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${
              item.description || "Prestation"
            }</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${quantite}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatMontant(
              totalLigne
            )}</td>
          </tr>
        `;
      })
      .join("");

    const piecesJointes =
      typeof pdfBase64 === "string" && pdfBase64.length > 0
        ? [
            {
              filename:
                typeof nomFichier === "string" && nomFichier.length > 0
                  ? nomFichier
                  : `${numeroFacture}.pdf`,
              content: pdfBase64,
            },
          ]
        : undefined;

    const { error } = await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: facture.customer_email,
      subject: `Votre facture ${numeroFacture} — ${nomEntreprise}`,
      attachments: piecesJointes,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Votre facture</h1>

          <p style="font-size: 15px; line-height: 1.6;">
            Bonjour ${nomClient},<br /><br />
            Veuillez trouver ci-joint votre facture
            <strong>${numeroFacture}</strong> établie par ${nomEntreprise}, au format PDF.
            Vous en trouverez également le récapitulatif ci-dessous.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #0f172a; color: white;">
                <th style="padding: 10px; text-align: left;">Prestation</th>
                <th style="padding: 10px; text-align: center;">Qté</th>
                <th style="padding: 10px; text-align: right;">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${lignesHtml}
            </tbody>
          </table>

          <div style="background: #eff6ff; border-radius: 8px; padding: 16px 20px; margin: 16px 0; text-align: right;">
            <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1d4ed8;">
              Total TTC : ${formatMontant(Number(facture.total_amount ?? 0))}
            </p>
          </div>

          ${
            facture.due_date
              ? `<p style="font-size: 14px; color: #475569;">Échéance de paiement : ${formatDate(
                  facture.due_date
                )}.</p>`
              : ""
          }

          <p style="font-size: 15px; line-height: 1.6;">
            N'hésitez pas à nous contacter${
              entreprise?.phone ? ` au ${entreprise.phone}` : ""
            } pour toute question.
          </p>

          <p style="font-size: 13px; color: #64748b; margin-top: 28px;">
            Cordialement,<br />
            ${nomEntreprise}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur envoi email de facture :", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Erreur route envoi facture :", erreur);
    return NextResponse.json(
      { error: "Impossible d'envoyer la facture par email." },
      { status: 500 }
    );
  }
}