// API route : envoi de l'email de confirmation de rendez-vous au client.
//
// Appelée depuis app/page.tsx (fonction ajouterAppel) juste après la
// création ou la modification réussie d'un appel, uniquement si le client
// a une adresse email ET qu'une date d'intervention est renseignée.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, EMAIL_EXPEDITEUR } from "../../../lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, clientName, interventionDate, address } =
      await request.json();

    if (!email || !interventionDate) {
      return NextResponse.json(
        {
          error:
            "Adresse email ou date d'intervention manquante.",
        },
        { status: 400 }
      );
    }

    const { data: entreprise } = await supabaseAdmin
      .from("company_settings")
      .select("company_name, phone")
      .limit(1)
      .maybeSingle();

    const nomEntreprise =
      entreprise?.company_name || "Votre artisan";
    const telephoneEntreprise = entreprise?.phone || "";
    const nomClient = clientName || "Bonjour";

    const dateFormatee = new Date(
      interventionDate
    ).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });

    const { error } = await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: email,
      subject: `Confirmation de votre rendez-vous — ${nomEntreprise}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Rendez-vous confirmé ✅</h1>

          <p style="font-size: 15px; line-height: 1.6;">
            Bonjour ${nomClient},<br /><br />
            Votre rendez-vous avec <strong>${nomEntreprise}</strong> est confirmé pour :
          </p>

          <div style="background: #eff6ff; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1d4ed8; text-transform: capitalize;">
              📅 ${dateFormatee}
            </p>
            ${
              address
                ? `<p style="margin: 8px 0 0; font-size: 14px; color: #334155;">📍 ${address}</p>`
                : ""
            }
          </div>

          <p style="font-size: 15px; line-height: 1.6;">
            Un technicien se présentera à l'adresse indiquée pour votre intervention.
            ${
              telephoneEntreprise
                ? `En cas de besoin, vous pouvez nous joindre au <strong>${telephoneEntreprise}</strong>.`
                : ""
            }
          </p>

          <p style="font-size: 13px; color: #64748b; margin-top: 28px;">
            À bientôt,<br />
            ${nomEntreprise}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(
        "Erreur envoi email de confirmation de rendez-vous :",
        error
      );
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error(
      "Erreur route confirmation de rendez-vous :",
      erreur
    );
    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer l'email de confirmation de rendez-vous.",
      },
      { status: 500 }
    );
  }
}