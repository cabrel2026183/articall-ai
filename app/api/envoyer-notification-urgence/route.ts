// API route : envoi d'un email de notification interne à l'artisan
// quand une nouvelle intervention est créée avec la priorité "Urgente".
//
// Appelée depuis app/page.tsx (fonction ajouterAppel) juste après la
// création réussie d'un appel, uniquement si urgency === "urgent".
// Respecte le réglage notif_urgences de company_settings : si ce réglage
// est désactivé, aucun email n'est envoyé.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, EMAIL_EXPEDITEUR } from "../../../lib/resend";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { clientName, clientPhone, problem, address } =
      await request.json();

    const { data: entreprise, error: erreurEntreprise } =
      await supabaseAdmin
        .from("company_settings")
        .select("company_name, email, notif_urgences")
        .limit(1)
        .maybeSingle();

    if (erreurEntreprise) {
      console.error(
        "Erreur chargement paramètres entreprise :",
        erreurEntreprise
      );
      return NextResponse.json(
        { error: erreurEntreprise.message },
        { status: 500 }
      );
    }

    if (!entreprise?.notif_urgences) {
      return NextResponse.json({
        ok: true,
        skipped: "notifications_desactivees",
      });
    }

    if (!entreprise?.email) {
      return NextResponse.json({
        ok: true,
        skipped: "aucun_email_entreprise",
      });
    }

    const nomEntreprise = entreprise.company_name || "ArtiCall AI";
    const nomClient = clientName || "Client non renseigné";

    const { error } = await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: entreprise.email,
      subject: `🚨 Nouvelle intervention urgente — ${nomEntreprise}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 22px; margin-bottom: 12px; color: #dc2626;">
            🚨 Intervention urgente signalée
          </h1>

          <p style="font-size: 15px; line-height: 1.6;">
            Une nouvelle intervention a été enregistrée avec la priorité <strong>Urgente</strong>.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="margin: 0 0 8px; font-size: 15px;">
              <strong>Client :</strong> ${nomClient}
            </p>
            ${
              clientPhone
                ? `<p style="margin: 0 0 8px; font-size: 15px;"><strong>Téléphone :</strong> ${clientPhone}</p>`
                : ""
            }
            ${
              address
                ? `<p style="margin: 0 0 8px; font-size: 15px;"><strong>Adresse :</strong> ${address}</p>`
                : ""
            }
            ${
              problem
                ? `<p style="margin: 0; font-size: 15px;"><strong>Problème :</strong> ${problem}</p>`
                : ""
            }
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 28px;">
            Connectez-vous à ArtiCall AI pour traiter cette intervention.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(
        "Erreur envoi email de notification urgence :",
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
      "Erreur route notification urgence :",
      erreur
    );
    return NextResponse.json(
      {
        error:
          "Impossible d'envoyer l'email de notification d'urgence.",
      },
      { status: 500 }
    );
  }
}