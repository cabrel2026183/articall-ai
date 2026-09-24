import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Non authentifié." },
      { status: 401 }
    );
  }

  const token = authHeader.replace("Bearer ", "");

  // Client "anonyme" utilisé uniquement pour vérifier le token de
  // l'utilisateur qui appelle la route.
  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Utilisateur invalide." },
      { status: 401 }
    );
  }

  // Client "service_role" utilisé pour lire les données une fois
  // l'utilisateur authentifié ci-dessus : il contourne les règles RLS,
  // ce qui évite qu'une lecture anonyme renvoie "aucune ligne" par erreur.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("company_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.company_id || profile.role !== "admin") {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs." },
      { status: 403 }
    );
  }

  const { data: entreprise } = await supabaseAdmin
    .from("company_settings")
    .select("stripe_customer_id")
    .eq("company_id", profile.company_id)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],
      customer: entreprise?.stripe_customer_id || undefined,
      success_url:
        "https://app.articallai.com/parametres/abonnement?paiement=succes",
      cancel_url:
        "https://app.articallai.com/parametres/abonnement?paiement=annule",
      metadata: {
        company_id: profile.company_id,
      },
      subscription_data: {
        metadata: {
          company_id: profile.company_id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(
      "Erreur création session de paiement Stripe :",
      error
    );

    return NextResponse.json(
      { error: "Impossible de créer la session de paiement." },
      { status: 500 }
    );
  }
}