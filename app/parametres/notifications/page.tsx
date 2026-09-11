"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type FormNotifications = {
  id: string;
  notif_urgences: boolean;
  notif_factures_impayees: boolean;
  notif_interventions_jour: boolean;
};

export default function NotificationsSettingsPage() {
  const [form, setForm] = useState<FormNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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

    await chargerParametres();
  }

  async function chargerParametres() {
    setLoading(true);

    const { data, error } = await supabase
      .from("company_settings")
      .select(
        "id, notif_urgences, notif_factures_impayees, notif_interventions_jour"
      )
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur chargement paramètres notifications :",
        error
      );
      setErreur("Impossible de charger les paramètres.");
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        id: data.id,
        notif_urgences: data.notif_urgences ?? true,
        notif_factures_impayees:
          data.notif_factures_impayees ?? true,
        notif_interventions_jour:
          data.notif_interventions_jour ?? true,
      });
    }

    setLoading(false);
  }

  async function enregistrer(
    champ:
      | "notif_urgences"
      | "notif_factures_impayees"
      | "notif_interventions_jour",
    valeur: boolean
  ) {
    if (!form) return;

    setSaving(true);
    setMessage("");
    setErreur("");

    const ancienForm = form;
    setForm({ ...form, [champ]: valeur });

    const { error } = await supabase
      .from("company_settings")
      .update({ [champ]: valeur })
      .eq("id", form.id);

    if (error) {
      console.error(
        "Erreur enregistrement paramètre notification :",
        error
      );
      setErreur(
        "Erreur lors de l'enregistrement. Veuillez réessayer."
      );
      setForm(ancienForm);
      setSaving(false);
      return;
    }

    setMessage("Paramètre mis à jour.");
    setSaving(false);
  }

  function Interrupteur({
    valeur,
    onChange,
  }: {
    valeur: boolean;
    onChange: () => void;
  }) {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={valeur}
        disabled={saving}
        onClick={onChange}
        className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
          valeur ? "bg-blue-600" : "bg-gray-300"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            valeur ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    );
  }

  if (loading || !form) {
    return (
      <main className="p-6">
        <p>Chargement des paramètres...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🔔 Notifications</h1>
        <p className="mt-2 text-gray-600">
          Configurez les alertes reçues dans l'application.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {erreur}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Dans l'application
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold">Interventions urgentes</h2>
            <p className="mt-2 text-sm text-gray-600">
              Alerte dans la cloche de notifications quand une
              intervention urgente est en attente.
            </p>
          </div>

          <Interrupteur
            valeur={form.notif_urgences}
            onChange={() =>
              enregistrer("notif_urgences", !form.notif_urgences)
            }
          />
        </div>

        <div className="flex items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold">Factures impayées</h2>
            <p className="mt-2 text-sm text-gray-600">
              Alerte dans la cloche de notifications pour les factures
              en attente de paiement.
            </p>
          </div>

          <Interrupteur
            valeur={form.notif_factures_impayees}
            onChange={() =>
              enregistrer(
                "notif_factures_impayees",
                !form.notif_factures_impayees
              )
            }
          />
        </div>

        <div className="flex items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold">Interventions du jour</h2>
            <p className="mt-2 text-sm text-gray-600">
              Alerte dans la cloche de notifications pour les
              interventions planifiées aujourd'hui.
            </p>
          </div>

          <Interrupteur
            valeur={form.notif_interventions_jour}
            onChange={() =>
              enregistrer(
                "notif_interventions_jour",
                !form.notif_interventions_jour
              )
            }
          />
        </div>
      </div>

      <div className="mb-3 mt-10 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Par email et SMS
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-6 rounded-xl border border-dashed bg-gray-50 p-6 opacity-60">
          <div>
            <h2 className="font-semibold">Notifications par email</h2>
            <p className="mt-2 text-sm text-gray-600">
              Envoi d'un email au client à chaque étape clé (devis
              envoyé, facture émise...).
            </p>
            <p className="mt-2 text-xs font-semibold text-orange-600">
              Bientôt disponible — nécessite la configuration du
              service d'envoi d'emails.
            </p>
          </div>

          <Interrupteur valeur={false} onChange={() => {}} />
        </div>

        <div className="flex items-start justify-between gap-6 rounded-xl border border-dashed bg-gray-50 p-6 opacity-60">
          <div>
            <h2 className="font-semibold">Notifications par SMS</h2>
            <p className="mt-2 text-sm text-gray-600">
              Rappel de rendez-vous par SMS avant l'intervention.
            </p>
            <p className="mt-2 text-xs font-semibold text-orange-600">
              Bientôt disponible — nécessite la configuration de la
              téléphonie.
            </p>
          </div>

          <Interrupteur valeur={false} onChange={() => {}} />
        </div>
      </div>
    </main>
  );
}