"use client";

import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <div className="legal-page">
      <style jsx global>{`
        .legal-page {
          --ink: #0b1220;
          --electric: #3b82f6;
          --paper: #f8fafc;
          --slate: #94a3b8;

          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
          background: var(--ink);
          color: var(--paper);
        }

        .legal-nav {
          padding: 24px 40px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .legal-nav a {
          font-weight: 800;
          color: var(--paper);
          text-decoration: none;
        }

        .legal-nav a em {
          font-style: normal;
          color: var(--electric);
        }

        .legal-container {
          max-width: 760px;
          margin: 0 auto;
          padding: 50px 24px 100px;
        }

        .legal-warning {
          background: rgba(234, 140, 85, 0.12);
          border: 1px solid rgba(234, 140, 85, 0.35);
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 13px;
          color: #fcd9b8;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .legal-container h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 32px;
        }

        .legal-container h2 {
          font-size: 18px;
          font-weight: 700;
          margin: 36px 0 12px;
          color: var(--paper);
        }

        .legal-container p,
        .legal-container li {
          font-size: 15px;
          line-height: 1.7;
          color: #cbd5e1;
        }

        .legal-container .placeholder {
          color: #fcd9b8;
          font-weight: 600;
        }

        .legal-back {
          display: inline-block;
          margin-bottom: 24px;
          color: var(--slate);
          font-size: 13px;
          text-decoration: none;
        }
      `}</style>

      <nav className="legal-nav">
        <Link href="/">
          ArtiCall<em> AI</em>
        </Link>
      </nav>

      <div className="legal-container">
        <Link href="/" className="legal-back">
          ← Retour à l'accueil
        </Link>

        <div className="legal-warning">
          ⚠️ Document de travail — à compléter avec vos informations
          réelles (repérables en orange ci-dessous) et à faire relire par
          un professionnel du droit avant toute mise en ligne officielle.
        </div>

        <h1>Mentions légales</h1>

        <h2>Éditeur du site</h2>
        <p>
          Le site ArtiCall AI est édité par{" "}
          <span className="placeholder">
            [Nom et prénom de l'auto-entrepreneur]
          </span>
          , entreprise individuelle immatriculée sous le numéro SIRET{" "}
          <span className="placeholder">[Numéro SIRET]</span>, dont le
          siège est situé <span className="placeholder">
            [Adresse complète]
          </span>
          .
        </p>
        <p>
          Contact : <span className="placeholder">
            [Adresse e-mail de contact]
          </span>
        </p>

        <h2>Directeur de la publication</h2>
        <p>
          <span className="placeholder">
            [Nom et prénom de l'auto-entrepreneur]
          </span>
          , en qualité de responsable de l'entreprise éditrice du site.
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
          Covina, CA 91723, États-Unis. La base de données est hébergée
          par Supabase Inc.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, logos,
          éléments graphiques) est la propriété d'ArtiCall AI, sauf
          mention contraire, et ne peut être reproduit sans autorisation
          préalable.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative au site ou à ces mentions
          légales : <span className="placeholder">
            [Adresse e-mail de contact]
          </span>
        </p>
      </div>
    </div>
  );
}