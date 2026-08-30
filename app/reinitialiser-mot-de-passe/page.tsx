"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();

  const [pret, setPret] = useState(false);
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setPret(true);
      }
    });

    // Filet de sécurité : si l'événement PASSWORD_RECOVERY a déjà
    // été traité avant que ce composant ne s'abonne
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPret(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function enregistrerNouveauMotDePasse(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setErreur("");

    if (nouveauMotDePasse.length < 8) {
      setErreur(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (nouveauMotDePasse !== confirmation) {
      setErreur("La confirmation ne correspond pas.");
      return;
    }

    setEnregistrement(true);

    const { error } = await supabase.auth.updateUser({
      password: nouveauMotDePasse,
    });

    if (error) {
      console.error(
        "Erreur réinitialisation mot de passe :",
        error
      );
      setErreur(error.message);
      setEnregistrement(false);
      return;
    }

    setMessage(
      "Votre mot de passe a été réinitialisé. Redirection..."
    );

    setTimeout(() => {
      router.push("/");
    }, 1500);
  }

  if (!pret) {
    return (
      <main
        style={{
          padding: "40px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h1>Réinitialisation du mot de passe</h1>

        <p style={{ color: "#64748b" }}>
          Vérification du lien de réinitialisation...
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <h1>Nouveau mot de passe</h1>

      <form onSubmit={enregistrerNouveauMotDePasse}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={nouveauMotDePasse}
          onChange={(event) =>
            setNouveauMotDePasse(event.target.value)
          }
          required
          style={{
            display: "block",
            marginBottom: "10px",
            width: "100%",
            padding: "10px",
          }}
        />

        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmation}
          onChange={(event) =>
            setConfirmation(event.target.value)
          }
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
          disabled={enregistrement}
          style={{ padding: "10px 16px" }}
        >
          {enregistrement
            ? "Enregistrement..."
            : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </main>
  );
}