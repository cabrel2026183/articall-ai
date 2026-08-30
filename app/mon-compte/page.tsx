"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type MonCompteForm = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
};

const valeursInitiales: MonCompteForm = {
  id: "",
  email: "",
  full_name: "",
  phone: "",
  address: "",
};

export default function MonComptePage() {
  const [form, setForm] = useState<MonCompteForm>(
    valeursInitiales
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [nouvelEmail, setNouvelEmail] = useState("");
  const [envoiEmail, setEnvoiEmail] = useState(false);
  const [messageEmail, setMessageEmail] = useState("");
  const [erreurEmail, setErreurEmail] = useState("");

  useEffect(() => {
    chargerMonProfil();
  }, []);

  async function chargerMonProfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Erreur chargement du profil :",
        error
      );
      setErreur(
        "Impossible de charger votre profil."
      );
      setLoading(false);
      return;
    }

    if (data) {
      const emailReel = user.email || "";

      // Si l'email a changé côté authentification (confirmation d'un
      // changement d'email en attente), on resynchronise profiles.email.
      if (data.email !== emailReel && emailReel) {
        await supabase
          .from("profiles")
          .update({ email: emailReel })
          .eq("id", data.id);
      }

      setForm({
        id: data.id,
        email: emailReel || data.email || "",
        full_name: data.full_name || "",
        phone: data.phone || "",
        address: data.address || "",
      });
    }

    setLoading(false);
  }

  function modifierChamp(
    champ: "full_name" | "phone" | "address",
    valeur: string
  ) {
    setForm((ancienneValeur) => ({
      ...ancienneValeur,
      [champ]: valeur,
    }));
  }

  async function demanderChangementEmail(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessageEmail("");
    setErreurEmail("");

    if (!nouvelEmail.trim()) {
      setErreurEmail("Indiquez le nouvel email.");
      return;
    }

    if (nouvelEmail.trim().toLowerCase() === form.email.toLowerCase()) {
      setErreurEmail(
        "Ce nouvel email est identique à l'email actuel."
      );
      return;
    }

    setEnvoiEmail(true);

    const { error } = await supabase.auth.updateUser({
      email: nouvelEmail.trim(),
    });

    if (error) {
      console.error(
        "Erreur demande changement email :",
        error
      );
      setErreurEmail(
        `Erreur : ${error.message || "Impossible de changer l'email."}`
      );
      setEnvoiEmail(false);
      return;
    }

    setMessageEmail(
      "Un email de confirmation vient d'être envoyé à votre nouvelle adresse. Cliquez sur le lien qu'il contient pour finaliser le changement."
    );
    setNouvelEmail("");
    setEnvoiEmail(false);
  }

  async function enregistrerProfil(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErreur("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        phone: form.phone || null,
        address: form.address || null,
      })
      .eq("id", form.id);

    if (error) {
      console.error(
        "Erreur enregistrement profil :",
        error
      );
      setErreur(
        `Erreur : ${error.message || "Enregistrement impossible."}`
      );
      setSaving(false);
      return;
    }

    setMessage("Vos informations ont été enregistrées.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Chargement de votre profil...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          👤 Mon compte
        </h1>

        <p className="mt-2 text-gray-600">
          Gérez vos informations personnelles.
        </p>
      </div>

      <form
        onSubmit={enregistrerProfil}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium">
            Adresse e-mail
          </label>

          <input
            type="email"
            value={form.email}
            disabled
            className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-gray-500"
          />

          <p className="mt-1 text-sm text-gray-500">
            Pour changer d'email, utilisez le formulaire dédié
            ci-dessous.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Nom complet
          </label>

          <input
            type="text"
            value={form.full_name}
            onChange={(event) =>
              modifierChamp("full_name", event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="Exemple : Jean Dupont"
          />
        </div>

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
            Adresse
          </label>

          <textarea
            value={form.address}
            onChange={(event) =>
              modifierChamp("address", event.target.value)
            }
            className="min-h-24 w-full rounded-lg border px-4 py-3"
            placeholder="Adresse complète"
          />
        </div>

        {erreur && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {erreur}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <form
        onSubmit={demanderChangementEmail}
        className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <h2 className="text-lg font-semibold">
            Changer d'adresse e-mail
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Un email de confirmation sera envoyé à la nouvelle
            adresse. Le changement ne sera effectif qu'après avoir
            cliqué sur le lien qu'il contient.
          </p>
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Nouvel e-mail
          </label>

          <input
            type="email"
            value={nouvelEmail}
            onChange={(event) =>
              setNouvelEmail(event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="nouveladresse@email.fr"
          />
        </div>

        {erreurEmail && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">
            {erreurEmail}
          </div>
        )}

        {messageEmail && (
          <div className="rounded-lg bg-green-50 p-4 text-green-700">
            {messageEmail}
          </div>
        )}

        <button
          type="submit"
          disabled={envoiEmail}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {envoiEmail
            ? "Envoi..."
            : "Envoyer le lien de confirmation"}
        </button>
      </form>
    </main>
  );
}