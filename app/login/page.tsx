"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import type { Trade } from "../../lib/types";

const METIERS: { valeur: Trade; icone: string; nom: string }[] = [
  { valeur: "plomberie", icone: "🔧", nom: "Plomberie" },
  { valeur: "electricien", icone: "⚡", nom: "Électricité" },
  { valeur: "serrurier", icone: "🔑", nom: "Serrurerie" },
  { valeur: "chauffagiste", icone: "🔥", nom: "Chauffage" },
];

type PendingMetadata = {
  pending_company_name?: string;
  pending_trade?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"inscription" | "connexion">(
    "inscription"
  );

  const [companyName, setCompanyName] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(
    null
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  async function finaliserInscription(
    nomEntreprise: string,
    metier: string
  ) {
    const { error } = await supabase.rpc(
      "creer_entreprise_et_profil",
      {
        p_company_name: nomEntreprise,
        p_trade: metier,
      }
    );

    if (error) {
      console.error(
        "Erreur création entreprise :",
        error
      );
    }
  }

  async function inscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErreur("");
    setMessage("");

    if (!selectedTrade) {
      setErreur("Choisissez votre métier avant de continuer.");
      return;
    }

    if (!companyName.trim()) {
      setErreur("Indiquez le nom de votre entreprise.");
      return;
    }

    setChargement(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          pending_company_name: companyName.trim(),
          pending_trade: selectedTrade,
        },
      },
    });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    if (data.session) {
      await finaliserInscription(companyName.trim(), selectedTrade);
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous."
    );
    setChargement(false);
  }

  async function connexion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErreur("");
    setMessage("");
    setChargement(true);

    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    if (data.user) {
      const { data: profil } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profil) {
        const meta = data.user.user_metadata as
          | PendingMetadata
          | undefined;

        if (meta?.pending_trade) {
          await finaliserInscription(
            meta.pending_company_name || "Mon entreprise",
            meta.pending_trade
          );
        }
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="login-page">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap");

        .login-page {
          --ink: #0b1220;
          --electric: #3b82f6;
          --copper: #ea8c55;
          --paper: #f8fafc;
          --slate: #94a3b8;

          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
          background: radial-gradient(
              circle at 15% 20%,
              rgba(59, 130, 246, 0.22),
              transparent 45%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(234, 140, 85, 0.16),
              transparent 50%
            ),
            linear-gradient(160deg, #0b1220 0%, #0f1b38 55%, #0b1220 100%);
          position: relative;
          overflow-x: hidden;
        }

        .login-lines {
          position: absolute;
          inset: 0;
          opacity: 0.25;
          pointer-events: none;
        }

        .login-lines path {
          stroke: var(--electric);
          stroke-width: 1;
          fill: none;
          stroke-dasharray: 6 10;
          animation: fluxLignes 14s linear infinite;
        }

        .login-lines path:nth-child(2) {
          stroke: var(--copper);
          animation-duration: 18s;
          animation-direction: reverse;
        }

        .login-lines path:nth-child(3) {
          stroke: var(--electric);
          animation-duration: 22s;
          opacity: 0.6;
        }

        @keyframes fluxLignes {
          to {
            stroke-dashoffset: -400;
          }
        }

        .login-topbar {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 40px;
        }

        .login-topbar-wordmark {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--paper);
          line-height: 1.1;
        }

        .login-topbar-wordmark em {
          font-style: normal;
          color: var(--electric);
        }

        .login-topbar-tagline {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--slate);
          margin-top: 2px;
        }

        .login-mode-toggle {
          font-size: 13px;
          color: var(--slate);
        }

        .login-mode-toggle button {
          border: none;
          background: transparent;
          color: var(--electric);
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          margin-left: 6px;
        }

        .login-mode-toggle button:hover {
          text-decoration: underline;
        }

        .login-main {
          position: relative;
          z-index: 1;
          max-width: 720px;
          margin: 0 auto;
          padding: 30px 24px 90px;
        }

        .login-main-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(28px, 4.5vw, 40px);
          line-height: 1.15;
          font-weight: 700;
          color: var(--paper);
          text-align: center;
          margin: 0 0 12px;
        }

        .login-main-subtitle {
          font-size: 15px;
          color: var(--slate);
          text-align: center;
          max-width: 460px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .login-card {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 22px;
          padding: 32px;
          backdrop-filter: blur(14px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        .login-field {
          margin-bottom: 16px;
        }

        .login-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
          margin-bottom: 6px;
        }

        .login-field input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 11px;
          border: 1.5px solid rgba(148, 163, 184, 0.25);
          background: rgba(255, 255, 255, 0.04);
          color: var(--paper);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .login-field input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }

        .login-field input:focus-visible {
          border-color: var(--electric);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .login-metiers-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
          margin-bottom: 10px;
          display: block;
        }

        .login-metiers-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (min-width: 480px) {
          .login-metiers-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .login-metier-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 18px 10px;
          border-radius: 14px;
          border: 1.5px solid rgba(148, 163, 184, 0.2);
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .login-metier-card-icone {
          font-size: 28px;
        }

        .login-metier-card-nom {
          font-size: 13px;
          font-weight: 600;
          color: var(--slate);
        }

        .login-metier-card:hover {
          border-color: rgba(59, 130, 246, 0.4);
        }

        .login-metier-card.actif {
          border-color: var(--electric);
          background: rgba(59, 130, 246, 0.14);
        }

        .login-metier-card.actif .login-metier-card-nom {
          color: var(--paper);
        }

        .login-actions {
          margin-top: 22px;
        }

        .login-btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, var(--electric), #1d4ed8);
          color: white;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: filter 0.15s ease;
        }

        .login-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
        }

        .login-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-forgot {
          text-align: center;
          margin-top: 18px;
        }

        .login-forgot a {
          color: var(--electric);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .login-forgot a:hover {
          text-decoration: underline;
        }

        .login-alert {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .login-alert.erreur {
          background: rgba(239, 68, 68, 0.12);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .login-alert.succes {
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
      `}</style>

      <svg
        className="login-lines"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-20 120 H340 Q380 120 380 160 V320 Q380 360 420 360 H820 Q860 360 860 400 V700" />
        <path d="M-20 500 H260 Q300 500 300 460 V260 Q300 220 340 220 H720 Q760 220 760 180 V-20" />
        <path d="M1220 80 H740 Q700 80 700 120 V480 Q700 520 660 520 H220 Q180 520 180 560 V820" />
      </svg>

      <header className="login-topbar">
        <div>
          <div className="login-topbar-wordmark">
            ArtiCall<em> AI</em>
          </div>
          <div className="login-topbar-tagline">
            ASSISTANT IA POUR ARTISANS
          </div>
        </div>

        <div className="login-mode-toggle">
          {mode === "inscription" ? (
            <>
              Déjà un compte ?
              <button
                type="button"
                onClick={() => {
                  setMode("connexion");
                  setErreur("");
                  setMessage("");
                }}
              >
                Se connecter
              </button>
            </>
          ) : (
            <>
              Pas encore de compte ?
              <button
                type="button"
                onClick={() => {
                  setMode("inscription");
                  setErreur("");
                  setMessage("");
                }}
              >
                Créer un compte
              </button>
            </>
          )}
        </div>
      </header>

      <main className="login-main">
        {mode === "inscription" ? (
          <>
            <h1 className="login-main-title">
              Créez votre espace ArtiCall AI
            </h1>
            <p className="login-main-subtitle">
              Renseignez votre entreprise et votre métier — votre
              questionnaire de diagnostic sera prêt immédiatement.
            </p>

            <div className="login-card">
              <form onSubmit={inscription}>
                <div className="login-field">
                  <label htmlFor="company-name">
                    Nom de votre entreprise
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    placeholder="Ex : Plomberie Martin"
                    value={companyName}
                    onChange={(event) =>
                      setCompanyName(event.target.value)
                    }
                    required
                  />
                </div>

                <span className="login-metiers-label">
                  Votre métier
                </span>

                <div className="login-metiers-grid">
                  {METIERS.map((metier) => (
                    <button
                      key={metier.valeur}
                      type="button"
                      onClick={() => setSelectedTrade(metier.valeur)}
                      className={
                        "login-metier-card" +
                        (selectedTrade === metier.valeur
                          ? " actif"
                          : "")
                      }
                    >
                      <span className="login-metier-card-icone">
                        {metier.icone}
                      </span>
                      <span className="login-metier-card-nom">
                        {metier.nom}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="login-field">
                  <label htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="vous@entreprise.fr"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="signup-password">
                    Mot de passe
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="8 caractères minimum"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />
                </div>

                {erreur && (
                  <div className="login-alert erreur">{erreur}</div>
                )}

                {message && (
                  <div className="login-alert succes">{message}</div>
                )}

                <div className="login-actions">
                  <button
                    type="submit"
                    className="login-btn-primary"
                    disabled={chargement}
                  >
                    {chargement
                      ? "Création..."
                      : "Créer mon compte"}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <h1 className="login-main-title">Connexion</h1>
            <p className="login-main-subtitle">
              Accédez à votre espace ArtiCall AI.
            </p>

            <div className="login-card">
              <form onSubmit={connexion}>
                <div className="login-field">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="vous@entreprise.fr"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="login-field">
                  <label htmlFor="login-password">
                    Mot de passe
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                  />
                </div>

                {erreur && (
                  <div className="login-alert erreur">{erreur}</div>
                )}

                {message && (
                  <div className="login-alert succes">{message}</div>
                )}

                <div className="login-actions">
                  <button
                    type="submit"
                    className="login-btn-primary"
                    disabled={chargement}
                  >
                    {chargement ? "Connexion..." : "Se connecter"}
                  </button>
                </div>
              </form>

              <div className="login-forgot">
                <a href="/mot-de-passe-oublie">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}