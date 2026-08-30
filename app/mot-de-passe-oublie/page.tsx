"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  async function envoyerLienReinitialisation(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");
    setEnvoi(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      }
    );

    if (error) {
      console.error(
        "Erreur envoi lien de réinitialisation :",
        error
      );
      setErreur(error.message);
      setEnvoi(false);
      return;
    }

    setMessage(
      "Si un compte existe avec cet email, un lien de réinitialisation vient de vous être envoyé."
    );
    setEnvoi(false);
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Mot de passe oublié</h1>

      <p style={{ color: "#64748b" }}>
        Indiquez votre email, nous vous enverrons un lien pour
        réinitialiser votre mot de passe.
      </p>

      <form onSubmit={envoyerLienReinitialisation}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px",
          }}
        />

        {erreur && (
          <p style={{ color: "#dc2626" }}>{erreur}</p>
        )}

        {message && (
          <p style={{ color: "#16a34a" }}>{message}</p>
        )}

        <button
          type="submit"
          disabled={envoi}
          style={{ padding: "10px 16px" }}
        >
          {envoi ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>

      <div style={{ marginTop: "14px" }}>
        <Link
          href="/login"
          style={{ color: "#2563eb", fontSize: "14px" }}
        >
          ← Retour à la connexion
        </Link>
      </div>
    </main>
  );
}