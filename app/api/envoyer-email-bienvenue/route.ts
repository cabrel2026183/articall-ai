// API route : envoi de l'email de bienvenue après création d'un compte.
//
// Appelée depuis app/login/page.tsx juste après un signUp réussi (ou après
// la première connexion suivant la confirmation d'email). La clé Resend
// reste côté serveur — c'est pour ça que l'envoi passe par cette route
// plutôt que d'appeler Resend directement depuis le composant client.

import { NextResponse } from "next/server";
import { resend, EMAIL_EXPEDITEUR } from "../../../lib/resend";

export async function POST(request: Request) {
  try {
    const { email, companyName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Adresse email manquante." },
        { status: 400 }
      );
    }

    const nomEntreprise = companyName || "votre entreprise";

    const { error } = await resend.emails.send({
      from: EMAIL_EXPEDITEUR,
      to: email,
      subject: "Bienvenue sur ArtiCall AI 👋",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 22px; margin-bottom: 12px;">Bienvenue sur ArtiCall AI !</h1>

          <p style="font-size: 15px; line-height: 1.6;">
            Bonjour,<br /><br />
            Votre compte pour <strong>${nomEntreprise}</strong> est prêt.
            Vous bénéficiez de <strong>14 jours d'essai gratuit</strong> pour
            découvrir la gestion d'appels, le diagnostic assisté par IA,
            les devis, les factures et le planning technicien.
          </p>

          <p style="font-size: 15px; line-height: 1.6;">
            Vous pouvez dès maintenant configurer votre entreprise dans les
            paramètres et créer votre premier appel.
          </p>

          <a
            href="https://app.articallai.com"
            style="display: inline-block; margin-top: 16px; padding: 12px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 700;"
          >
            Accéder à mon espace
          </a>

          <p style="font-size: 13px; color: #64748b; margin-top: 28px;">
            À bientôt,<br />
            L'équipe ArtiCall AI
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Erreur envoi email de bienvenue :", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (erreur) {
    console.error("Erreur route email de bienvenue :", erreur);
    return NextResponse.json(
      { error: "Impossible d'envoyer l'email de bienvenue." },
      { status: 500 }
    );
  }
}