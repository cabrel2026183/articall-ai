"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { CompanySettings } from "../../../lib/types";

const METIERS_DISPONIBLES = [
  { value: "plomberie", label: "🔧 Plomberie" },
  { value: "electricien", label: "⚡ Électricien" },
  { value: "serrurier", label: "🔑 Serrurier" },
  { value: "chauffagiste", label: "🔥 Chauffagiste" },
];

const valeursInitiales: CompanySettings = {
  company_name: "",
  logo_url: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  siret: "",
  tva_number: "",
  primary_color: "#2563eb",
  trade: "plomberie",
};

export default function CompanySettingsPage() {
  const [form, setForm] =
    useState<CompanySettings>(valeursInitiales);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

    await chargerEntreprise();
  }

  async function chargerEntreprise() {
    setLoading(true);

    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erreur chargement entreprise :", error);
      setMessage(
        "Impossible de charger les informations de l’entreprise."
      );
    }

    if (data) {
      setForm({
        id: data.id,
        company_name: data.company_name || "",
        logo_url: data.logo_url || "",
        address: data.address || "",
        phone: data.phone || "",
        email: data.email || "",
        website: data.website || "",
        siret: data.siret || "",
        tva_number: data.tva_number || "",
        primary_color: data.primary_color || "#2563eb",
        trade: data.trade || "plomberie",
      });
    }

    setLoading(false);
  }

  function modifierChamp(
    champ: keyof CompanySettings,
    valeur: string
  ) {
    setForm((ancienneValeur) => ({
      ...ancienneValeur,
      [champ]: valeur,
    }));
  }

  async function enregistrerEntreprise(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const donnees = {
      company_name: form.company_name,
      logo_url: form.logo_url,
      address: form.address,
      phone: form.phone,
      email: form.email,
      website: form.website,
      siret: form.siret,
      tva_number: form.tva_number,
      primary_color: form.primary_color,
      trade: form.trade,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (form.id) {
      const resultat = await supabase
        .from("company_settings")
        .update(donnees)
        .eq("id", form.id);

      error = resultat.error;
    } else {
      const resultat = await supabase
        .from("company_settings")
        .insert(donnees)
        .select()
        .single();

      error = resultat.error;

      if (resultat.data) {
        setForm((ancienneValeur) => ({
          ...ancienneValeur,
          id: resultat.data.id,
        }));
      }
    }

   if (error) {
  console.error("Erreur enregistrement entreprise :", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  setMessage(
    `Erreur : ${error.message || "Enregistrement impossible"}`
  );
} else {
  setMessage(
    "Les informations de l’entreprise ont été enregistrées."
  );
}

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Chargement des paramètres...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Mon entreprise
        </h1>

        <p className="mt-2 text-gray-600">
          Ces informations apparaîtront sur les bons
          d’intervention, les devis et les factures.
        </p>
      </div>

      <form
        onSubmit={enregistrerEntreprise}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium">
            Nom de l’entreprise
          </label>

          <input
            type="text"
            value={form.company_name}
            onChange={(event) =>
              modifierChamp(
                "company_name",
                event.target.value
              )
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="Exemple : Plomberie Martin"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Métier
          </label>

          <select
            value={form.trade}
            onChange={(event) =>
              setForm((ancienneValeur) => ({
                ...ancienneValeur,
                trade: event.target.value as CompanySettings["trade"],
              }))
            }
            className="w-full rounded-lg border px-4 py-3"
          >
            {METIERS_DISPONIBLES.map((metier) => (
              <option key={metier.value} value={metier.value}>
                {metier.label}
              </option>
            ))}
          </select>

          <p className="mt-2 text-sm text-gray-500">
            Détermine le questionnaire de diagnostic proposé lors de
            la création d'une intervention.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            URL du logo
          </label>

          <input
            type="url"
            value={form.logo_url}
            onChange={(event) =>
              modifierChamp("logo_url", event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Adresse
          </label>

          <textarea
            value={form.address}
            onChange={(event) =>
              modifierChamp("address", event.target.value)
            }
            className="min-h-24 w-full rounded-lg border px-4 py-3"
            placeholder="Adresse complète de l’entreprise"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Téléphone
            </label>

            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                modifierChamp("phone", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="06 00 00 00 00"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              E-mail
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                modifierChamp("email", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="contact@entreprise.fr"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Site internet
          </label>

          <input
            type="text"
            value={form.website}
            onChange={(event) =>
              modifierChamp("website", event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="www.entreprise.fr"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Numéro SIRET
            </label>

            <input
              type="text"
              value={form.siret}
              onChange={(event) =>
                modifierChamp("siret", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="12345678900011"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Numéro de TVA
            </label>

            <input
              type="text"
              value={form.tva_number}
              onChange={(event) =>
                modifierChamp(
                  "tva_number",
                  event.target.value
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="FR00123456789"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Couleur principale
          </label>

          <div className="flex items-center gap-4">
            <input
              type="color"
              value={form.primary_color}
              onChange={(event) =>
                modifierChamp(
                  "primary_color",
                  event.target.value
                )
              }
              className="h-12 w-20 cursor-pointer rounded border"
            />

            <span>{form.primary_color}</span>
          </div>
        </div>

        {message && (
          <div className="rounded-lg bg-gray-100 p-4">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving
            ? "Enregistrement..."
            : "Enregistrer les paramètres"}
        </button>
      </form>
    </main>
  );
}