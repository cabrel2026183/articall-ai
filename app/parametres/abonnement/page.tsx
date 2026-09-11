"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { SubscriptionStatus } from "../../../lib/types";

type AbonnementInfo = {
  subscription_plan: string;
  subscription_status: SubscriptionStatus;
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
      .select("subscription_plan, subscription_status")
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
      }
    );

    setLoading(false);
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

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
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

        <div className="mb-6">
          <span className="text-3xl font-bold">49 €</span>
          <span className="text-gray-500"> / mois</span>
          <p className="mt-1 text-sm text-gray-500">
            + 199 € d'installation (tarif indicatif, susceptible
            d'évoluer avant le lancement commercial officiel)
          </p>
        </div>

        <ul className="mb-6 space-y-2 text-sm text-gray-700">
          <li>✓ Diagnostic assisté par IA, tous métiers disponibles</li>
          <li>✓ Techniciens illimités</li>
          <li>✓ Devis et factures illimités</li>
          <li>✓ Planning technicien intégré</li>
        </ul>

        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          La gestion de l'abonnement en ligne (changement de formule,
          moyen de paiement, factures) n'est pas encore disponible en
          libre-service.
          <br />
          Pour toute question sur votre abonnement, contactez-nous à{" "}
          <a
            href="mailto:contact@articallai.fr"
            className="font-semibold text-blue-600"
          >
            contact@articallai.fr
          </a>
          .
        </div>
      </div>
    </main>
  );
}