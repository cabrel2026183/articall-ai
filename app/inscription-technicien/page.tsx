"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const COMPETENCES_METIER: { valeur: string; icone: string; nom: string }[] = [
  { valeur: "plomberie", icone: "🔧", nom: "Plomberie" },
  { valeur: "electricien", icone: "⚡", nom: "Électricité" },
  { valeur: "serrurier", icone: "🔑", nom: "Serrurerie" },
  { valeur: "chauffagiste", icone: "🔥", nom: "Chauffage" },
];

export default function InscriptionTechnicienPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [competencesChoisies, setCompetencesChoisies] = useState<string[]>(
    []
  );
  const [autresCompetences, setAutresCompetences] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  function basculerCompetence(valeur: string) {
    setCompetencesChoisies((actuelles) =>
      actuelles.includes(valeur)
        ? actuelles.filter((item) => item !== valeur)
        : [...actuelles, valeur]
    );
  }

  function construireListeCompetences(): string[] {
    const competencesLibres = autresCompetences
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return [...competencesChoisies, ...competencesLibres];
  }

  async function lierCompteEtRediriger(competences: string[]) {
    const { error } = await supabase.rpc("lier_compte_technicien", {
      p_skills: competences,
    });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return false;
    }

    router.push("/technicien");
    router.refresh();
    return true;
  }

  async function inscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErreur("");
    setMessage("");

    const competences = construireListeCompetences();

    if (competences.length === 0) {
      setErreur("Choisissez au moins une compétence avant de continuer.");
      return;
    }

    setChargement(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          pending_technician_skills: competences,
        },
      },
    });

    if (error) {
      setErreur(error.message);
      setChargement(false);
      return;
    }

    if (data.session) {
      await lierCompteEtRediriger(competences);
      return;
    }

    setMessage(
      "Compte créé ! Vérifiez votre email pour confirmer votre inscription, puis connectez-vous depuis la page de connexion habituelle."
    );
    setChargement(false);
  }

  return (
    <div className="technicien-signup-page">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap");

        .technicien-signup-page {
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

        .technicien-signup-topbar {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 40px;
        }

        .technicien-signup-topbar-wordmark {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: var(--paper);
          line-height: 1.1;
        }

        .technicien-signup-topbar-wordmark em {
          font-style: normal;
          color: var(--electric);
        }

        .technicien-signup-topbar-tagline {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--slate);
          margin-top: 2px;
        }

        .technicien-signup-link {
          font-size: 13px;
          color: var(--slate);
        }

        .technicien-signup-link a {
          color: var(--electric);
          font-weight: 700;
          text-decoration: none;
          margin-left: 6px;
        }

        .technicien-signup-link a:hover {
          text-decoration: underline;
        }

        .technicien-signup-main {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
          padding: 30px 24px 90px;
        }

        .technicien-signup-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(26px, 4.5vw, 36px);
          line-height: 1.15;
          font-weight: 700;
          color: var(--paper);
          text-align: center;
          margin: 0 0 12px;
        }

        .technicien-signup-subtitle {
          font-size: 15px;
          color: var(--slate);
          text-align: center;
          max-width: 460px;
          margin: 0 auto 40px;
          line-height: 1.6;
        }

        .technicien-signup-card {
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 22px;
          padding: 32px;
          backdrop-filter: blur(14px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
        }

        .technicien-signup-field {
          margin-bottom: 16px;
        }

        .technicien-signup-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
          margin-bottom: 6px;
        }

        .technicien-signup-field input {
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

        .technicien-signup-field input::placeholder {
          color: rgba(148, 163, 184, 0.6);
        }

        .technicien-signup-field input:focus-visible {
          border-color: var(--electric);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .technicien-signup-competences-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--paper);
          margin-bottom: 10px;
          display: block;
        }

        .technicien-signup-competences-aide {
          font-size: 12px;
          color: var(--slate);
          margin: -6px 0 12px;
        }

        .technicien-signup-competences-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        @media (min-width: 480px) {
          .technicien-signup-competences-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .technicien-signup-competence-card {
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

        .technicien-signup-competence-card-icone {
          font-size: 28px;
        }

        .technicien-signup-competence-card-nom {
          font-size: 13px;
          font-weight: 600;
          color: var(--slate);
        }

        .technicien-signup-competence-card:hover {
          border-color: rgba(59, 130, 246, 0.4);
        }

        .technicien-signup-competence-card.actif {
          border-color: var(--electric);
          background: rgba(59, 130, 246, 0.14);
        }

        .technicien-signup-competence-card.actif .technicien-signup-competence-card-nom {
          color: var(--paper);
        }

        .technicien-signup-actions {
          margin-top: 22px;
        }

        .technicien-signup-btn-primary {
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

        .technicien-signup-btn-primary:hover:not(:disabled) {
          filter: brightness(1.08);
        }

        .technicien-signup-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .technicien-signup-alert {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .technicien-signup-alert.erreur {
          background: rgba(239, 68, 68, 0.12);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .technicien-signup-alert.succes {
          background: rgba(34, 197, 94, 0.12);
          color: #86efac;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
      `}</style>

      <header className="technicien-signup-topbar">
        <div>
          <div className="technicien-signup-topbar-wordmark">
            ArtiCall<em> AI</em>
          </div>
          <div className="technicien-signup-topbar-tagline">
            ESPACE TECHNICIEN
          </div>
        </div>

        <div className="technicien-signup-link">
          Vous êtes l'artisan ?
          <a href="/login">Connexion / inscription entreprise</a>
        </div>
      </header>

      <main className="technicien-signup-main">
        <h1 className="technicien-signup-title">
          Rejoignez votre entreprise
        </h1>
        <p className="technicien-signup-subtitle">
          Utilisez la même adresse email que celle transmise à votre
          employeur : votre compte sera automatiquement relié à la fiche
          qu'il a créée pour vous.
        </p>

        <div className="technicien-signup-card">
          <form onSubmit={inscription}>
            <div className="technicien-signup-field">
              <label htmlFor="technicien-email">Email</label>
              <input
                id="technicien-email"
                type="email"
                placeholder="vous@email.fr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="technicien-signup-field">
              <label htmlFor="technicien-password">Mot de passe</label>
              <input
                id="technicien-password"
                type="password"
                placeholder="8 caractères minimum"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <span className="technicien-signup-competences-label">
              Vos compétences
            </span>
            <p className="technicien-signup-competences-aide">
              Sélectionnez un ou plusieurs métiers.
            </p>

            <div className="technicien-signup-competences-grid">
              {COMPETENCES_METIER.map((competence) => (
                <button
                  key={competence.valeur}
                  type="button"
                  onClick={() => basculerCompetence(competence.valeur)}
                  className={
                    "technicien-signup-competence-card" +
                    (competencesChoisies.includes(competence.valeur)
                      ? " actif"
                      : "")
                  }
                >
                  <span className="technicien-signup-competence-card-icone">
                    {competence.icone}
                  </span>
                  <span className="technicien-signup-competence-card-nom">
                    {competence.nom}
                  </span>
                </button>
              ))}
            </div>

            <div className="technicien-signup-field">
              <label htmlFor="technicien-autres-competences">
                Autres compétences (facultatif)
              </label>
              <input
                id="technicien-autres-competences"
                type="text"
                placeholder="Ex : climatisation, chauffe-eau"
                value={autresCompetences}
                onChange={(event) =>
                  setAutresCompetences(event.target.value)
                }
              />
            </div>

            {erreur && (
              <div className="technicien-signup-alert erreur">{erreur}</div>
            )}

            {message && (
              <div className="technicien-signup-alert succes">{message}</div>
            )}

            <div className="technicien-signup-actions">
              <button
                type="submit"
                className="technicien-signup-btn-primary"
                disabled={chargement}
              >
                {chargement ? "Création..." : "Créer mon compte technicien"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}