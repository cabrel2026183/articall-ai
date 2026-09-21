import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Client Supabase avec la clé de service : bypass RLS,
// nécessaire car cet appel vient de Stripe, pas d'un utilisateur
// authentifié dans l'application.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Signature manquante." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    console.error(
      "Erreur vérification signature webhook Stripe :",
      error
    );

    return NextResponse.json(
      { error: "Signature invalide." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const companyId = session.metadata?.company_id;

    if (companyId) {
      const { error } = await supabaseAdmin
        .from("company_settings")
        .update({
          subscription_status: "actif",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("company_id", companyId);

      if (error) {
        console.error(
          "Erreur mise à jour abonnement (checkout.session.completed) :",
          error
        );
      }
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const companyId = subscription.metadata?.company_id;

    const nouveauStatut =
      subscription.status === "active" ? "actif" : "suspendu";

    if (companyId) {
      const { error } = await supabaseAdmin
        .from("company_settings")
        .update({ subscription_status: nouveauStatut })
        .eq("company_id", companyId);

      if (error) {
        console.error(
          "Erreur mise à jour abonnement (subscription.updated/deleted) :",
          error
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}