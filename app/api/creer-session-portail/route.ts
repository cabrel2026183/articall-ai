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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json(
      { error: "Utilisateur invalide." },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
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

  const { data: entreprise } = await supabase
    .from("company_settings")
    .select("stripe_customer_id")
    .eq("company_id", profile.company_id)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  if (!entreprise?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Aucun abonnement actif à gérer." },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: entreprise.stripe_customer_id,
      return_url: "https://app.articallai.com/parametres/abonnement",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(
      "Erreur création session portail Stripe :",
      error
    );

    return NextResponse.json(
      { error: "Impossible d'ouvrir le portail client." },
      { status: 500 }
    );
  }
}