// API route : envoi d'un devis par email au client.
//
// Appelée depuis app/devis/[id]/page.tsx au clic sur "Envoyer par email".
// Récupère le devis, ses prestations et les infos de l'entreprise
// directement depuis Supabase (on ne fait confiance qu'au quoteId transmis,
// jamais aux données du devis envoyées par le client).

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
    const { quoteId } = await request.json();

    if (!quoteId) {
      return NextResponse.json(
        { error: "Identifiant du devis manquant." },
        { status: 400 }
      );
    }

    const { data: quote, error: quoteError } = await supabaseAdmin
      .from("quotes")
      .select(
        "id, quote_number, client_name, client_email, vat_rate, discount, total, valid_until"
      )
      .eq("id", quoteId)
      .maybeSingle();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: quoteError?.message || "Devis introuvable." },
        { status: 404 }
      );
    }

    if (!quote.client_email) {
      return NextResponse.json(
        { error: "Ce client n'a pas d'adresse email renseignée." },
        { status: 400 }
      );
    }

    const { data: items } = await supabaseAdmin
      .from("quote_items")
      .select("description, quantity, unit_price, line_total")
      .eq("quote_id", quoteId)
      .order("position", { ascending: true });

    const { data: entreprise } = await supabaseAdmin
      .from("company_settings")
      .select("company_name, phone, email")
      .limit(1)
      .maybeSingle();

    const nomEntreprise = entreprise?.company_name || "Votre artisan";
    const nomClient = quote.client_name || "Bonjour";
    const numeroDevis = quote.quote_number || `DEV-${quote.id.slice(0, 8)}`;

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

    const { error } = await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: quote.client_email,
      subject: `Votre devis ${numeroDevis} — ${nomEntreprise}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Votre devis</h1>

          <p style="font-size: 15px; line-height: 1.6;">
            Bonjour ${nomClient},<br /><br />
            Veuillez trouver ci-dessous le récapitulatif de votre devis
            <strong>${numeroDevis}</strong> établi par ${nomEntreprise}.
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
              Total TTC : ${formatMontant(Number(quote.total ?? 0))}
            </p>
          </div>

          <p style="font-size: 14px; color: #475569;">
            Ce devis est valable jusqu'au ${formatDate(quote.valid_until)}.
          </p>

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
      console.error("Erreur envoi email de devis :", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Erreur route envoi devis :", erreur);
    return NextResponse.json(
      { error: "Impossible d'envoyer le devis par email." },
      { status: 500 }
    );
  }
}