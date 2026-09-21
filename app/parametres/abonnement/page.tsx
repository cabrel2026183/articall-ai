"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { SubscriptionStatus } from "../../../lib/types";
import {
  TARIF_MENSUEL,
  TARIF_INSTALLATION,
  TARIF_INCLUS,
} from "../../../lib/tarifs";

type AbonnementInfo = {
  subscription_plan: string;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
};

const LABEL_STATUT: Record<
  SubscriptionStatus,
  { label: string; couleurFond: string; couleurTexte: string }
> = {
  essai: {
    label: "Période d'essai",
    couleurFond: "#fef3c7",
    couleurTexte: "#92400e",
  },
  actif: {
    label: "Actif",
    couleurFond: "#dcfce7",
    couleurTexte: "#166534",
  },
  suspendu: {
    label: "Suspendu",
    couleurFond: "#fee2e2",
    couleurTexte: "#b91c1c",
  },
};

export default function AbonnementSettingsPage() {
  const [abonnement, setAbonnement] = useState<AbonnementInfo | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [redirection, setRedirection] = useState(false);
  const [messagePaiement, setMessagePaiement] = useState("");

  useEffect(() => {
    const parametres = new URLSearchParams(window.location.search);

    if (parametres.get("paiement") === "succes") {
      setMessagePaiement(
        "Paiement confirmé ! Votre abonnement est en cours d'activation, cela peut prendre quelques instants."
      );
    } else if (parametres.get("paiement") === "annule") {
      setMessagePaiement("Le paiement a été annulé.");
    }
  }, []);

  useEffect(() => {
    verifierAccesEtCharger();
  }, []);

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

    await chargerAbonnement();
  }

  async function chargerAbonnement() {
    setLoading(true);

    const { data, error } = await supabase
      .from("company_settings")
      .select(
        "subscription_plan, subscription_status, trial_ends_at, stripe_customer_id"
      )
      .limit(1)
      .maybeSingle<AbonnementInfo>();

    if (error) {
      console.error(
        "Erreur chargement abonnement :",
        error
      );
      setErreur("Impossible de charger les informations d'abonnement.");
      setLoading(false);
      return;
    }

    setAbonnement(
      data || {
        subscription_plan: "standard",
        subscription_status: "essai",
        trial_ends_at: null,
        stripe_customer_id: null,
      }
    );

    setLoading(false);
  }

  async function appelerRouteStripe(chemin: string) {
    setErreur("");
    setRedirection(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setErreur("Session expirée, veuillez vous reconnecter.");
      setRedirection(false);
      return;
    }

    try {
      const reponse = await fetch(chemin, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await reponse.json();

      if (!reponse.ok || !data.url) {
        setErreur(
          data.error || "Une erreur est survenue. Veuillez réessayer."
        );
        setRedirection(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Erreur appel route Stripe :", error);
      setErreur("Une erreur est survenue. Veuillez réessayer.");
      setRedirection(false);
    }
  }

  function demarrerAbonnement() {
    appelerRouteStripe("/api/creer-session-paiement");
  }

  function ouvrirPortailClient() {
    appelerRouteStripe("/api/creer-session-portail");
  }

  function formaterDateEssai(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Chargement...</p>
      </main>
    );
  }

  const statut =
    LABEL_STATUT[abonnement?.subscription_status || "essai"];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">💳 Abonnement</h1>
        <p className="mt-2 text-gray-600">
          Consultez votre formule actuelle.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {erreur}
        </div>
      )}

      {messagePaiement && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-700">
          {messagePaiement}
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Formule Standard</h2>

          <span
            className="rounded-full px-3 py-1 text-xs font-bold"
            style={{
              backgroundColor: statut.couleurFond,
              color: statut.couleurTexte,
            }}
          >
            {statut.label}
          </span>
        </div>

        {abonnement?.subscription_status === "essai" &&
          abonnement.trial_ends_at && (
            <p className="mb-4 text-sm text-gray-500">
              Votre essai gratuit se termine le{" "}
              {formaterDateEssai(abonnement.trial_ends_at)}.
            </p>
          )}

        <div className="mb-6">
          <span className="text-3xl font-bold">{TARIF_MENSUEL} €</span>
          <span className="text-gray-500"> / mois</span>
          <p className="mt-1 text-sm text-gray-500">
            + {TARIF_INSTALLATION} € d'installation (tarif indicatif,
            susceptible d'évoluer avant le lancement commercial
            officiel)
          </p>
        </div>

        <ul className="mb-6 space-y-2 text-sm text-gray-700">
          {TARIF_INCLUS.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>

        {abonnement?.stripe_customer_id ? (
          <button
            type="button"
            onClick={ouvrirPortailClient}
            disabled={redirection}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {redirection
              ? "Redirection..."
              : "Gérer mon abonnement"}
          </button>
        ) : (
          <button
            type="button"
            onClick={demarrerAbonnement}
            disabled={redirection}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {redirection ? "Redirection..." : "S'abonner maintenant"}
          </button>
        )}

        <p className="mt-4 text-center text-xs text-gray-500">
          Paiement sécurisé par Stripe. Une question ?{" "}
          <a
            href="mailto:contact@articallai.fr"
            className="font-semibold text-blue-600"
          >
            contact@articallai.fr
          </a>
        </p>
      </div>
    </main>
  );
}