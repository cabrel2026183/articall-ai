"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function SecuriteSettingsPage() {
  const [email, setEmail] = useState("");
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] =
    useState("");

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

    setEmail(user.email || "");
    setLoading(false);
  }

  async function changerMotDePasse(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");

    if (nouveauMotDePasse.length < 8) {
      setErreur(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setErreur(
        "La confirmation ne correspond pas au nouveau mot de passe."
      );
      return;
    }

    setSaving(true);

    // Vérifie le mot de passe actuel avant d'autoriser le changement,
    // pour éviter qu'une session laissée ouverte permette de changer
    // le mot de passe sans le connaître.
    const { error: erreurReauth } =
      await supabase.auth.signInWithPassword({
        email,
        password: motDePasseActuel,
      });

    if (erreurReauth) {
      setErreur("Le mot de passe actuel est incorrect.");
      setSaving(false);
      return;
    }

    const { error: erreurMiseAJour } =
      await supabase.auth.updateUser({
        password: nouveauMotDePasse,
      });

    if (erreurMiseAJour) {
      console.error(
        "Erreur changement mot de passe :",
        erreurMiseAJour
      );

      setErreur(
        `Erreur : ${erreurMiseAJour.message || "Impossible de changer le mot de passe."}`
      );

      setSaving(false);
      return;
    }

    setMessage("Votre mot de passe a été mis à jour.");
    setMotDePasseActuel("");
    setNouveauMotDePasse("");
    setConfirmationMotDePasse("");
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
        <h1 className="text-3xl font-bold">🔐 Sécurité</h1>

        <p className="mt-2 text-gray-600">
          Modifiez le mot de passe de votre compte.
        </p>
      </div>

      <form
        onSubmit={changerMotDePasse}
        className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-medium">
            Adresse e-mail du compte
          </label>

          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border bg-gray-50 px-4 py-3 text-gray-500"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Mot de passe actuel
          </label>

          <input
            type="password"
            value={motDePasseActuel}
            onChange={(event) =>
              setMotDePasseActuel(event.target.value)
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Nouveau mot de passe
            </label>

            <input
              type="password"
              value={nouveauMotDePasse}
              onChange={(event) =>
                setNouveauMotDePasse(event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="8 caractères minimum"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Confirmer le nouveau mot de passe
            </label>

            <input
              type="password"
              value={confirmationMotDePasse}
              onChange={(event) =>
                setConfirmationMotDePasse(event.target.value)
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="••••••••"
              required
            />
          </div>
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
          {saving
            ? "Modification..."
            : "Changer le mot de passe"}
        </button>
      </form>
    </main>
  );
}