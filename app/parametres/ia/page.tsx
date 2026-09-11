"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type FormIA = {
  id: string;
  ia_detection_auto: boolean;
  ia_attribution_auto: boolean;
};

export default function IASettingsPage() {
  const [form, setForm] = useState<FormIA | null>(null);
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
      .select("id, ia_detection_auto, ia_attribution_auto")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur chargement paramètres IA :",
        error
      );
      setErreur(
        "Impossible de charger les paramètres."
      );
      setLoading(false);
      return;
    }

    if (data) {
      setForm({
        id: data.id,
        ia_detection_auto: data.ia_detection_auto ?? true,
        ia_attribution_auto:
          data.ia_attribution_auto ?? true,
      });
    }

    setLoading(false);
  }

  async function enregistrer(
    champ: "ia_detection_auto" | "ia_attribution_auto",
    valeur: boolean
  ) {
    if (!form) return;

    setSaving(true);
    setMessage("");
    setErreur("");

    const nouveauForm = { ...form, [champ]: valeur };
    setForm(nouveauForm);

    const { error } = await supabase
      .from("company_settings")
      .update({ [champ]: valeur })
      .eq("id", form.id);

    if (error) {
      console.error(
        "Erreur enregistrement paramètre IA :",
        error
      );
      setErreur(
        "Erreur lors de l'enregistrement. Veuillez réessayer."
      );
      setForm(form);
      setSaving(false);
      return;
    }

    setMessage("Paramètre mis à jour.");
    setSaving(false);
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
        <h1 className="text-3xl font-bold">
          🤖 Intelligence artificielle
        </h1>

        <p className="mt-2 text-gray-600">
          Activez ou désactivez les fonctions automatiques
          d'ArtiCall AI.
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

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Détection automatique du diagnostic
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Quand la description du problème contient un mot-clé
              clair (ex. "lavabo", "chauffe-eau"), le questionnaire de
              diagnostic saute directement à la question pertinente
              au lieu de tout redemander depuis le début.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.ia_detection_auto}
            disabled={saving}
            onClick={() =>
              enregistrer(
                "ia_detection_auto",
                !form.ia_detection_auto
              )
            }
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
              form.ia_detection_auto
                ? "bg-blue-600"
                : "bg-gray-300"
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.ia_detection_auto
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-start justify-between gap-6 rounded-xl border bg-white p-6 shadow-sm">
          <div>
            <h2 className="font-semibold">
              Attribution automatique du technicien
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Affiche le bouton "✨ Trouver le meilleur technicien"
              lors de la création d'une intervention, qui propose
              automatiquement un technicien compatible et un créneau
              libre selon la localisation et les compétences.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.ia_attribution_auto}
            disabled={saving}
            onClick={() =>
              enregistrer(
                "ia_attribution_auto",
                !form.ia_attribution_auto
              )
            }
            className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-colors ${
              form.ia_attribution_auto
                ? "bg-blue-600"
                : "bg-gray-300"
            } disabled:opacity-50`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.ia_attribution_auto
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </main>
  );
}