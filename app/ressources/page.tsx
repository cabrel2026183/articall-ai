"use client";

import Link from "next/link";
import { ARTICLES } from "../../lib/articles";

export default function RessourcesPage() {
  function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <div className="res-page">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap");

        .res-page {
          --ink: #0b1220;
          --electric: #3b82f6;
          --paper: #f8fafc;
          --slate: #94a3b8;

          min-height: 100vh;
          font-family: "Inter", system-ui, sans-serif;
          background: var(--ink);
          color: var(--paper);
        }

        .res-nav {
          padding: 24px 40px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .res-nav a {
          font-family: "Space Grotesk", sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: var(--paper);
          text-decoration: none;
        }

        .res-nav a em {
          font-style: normal;
          color: var(--electric);
        }

        .res-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 60px 24px 100px;
        }

        .res-back {
          display: inline-block;
          margin-bottom: 24px;
          color: var(--slate);
          font-size: 13px;
          text-decoration: none;
        }

        .res-back:hover {
          color: var(--paper);
        }

        .res-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 700;
          margin: 0 0 12px;
        }

        .res-subtitle {
          color: var(--slate);
          font-size: 16px;
          margin: 0 0 48px;
          max-width: 520px;
        }

        .res-liste {
          display: grid;
          gap: 20px;
        }

        .res-card {
          display: block;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          padding: 26px;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s ease;
        }

        .res-card:hover {
          border-color: var(--electric);
        }

        .res-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--slate);
          margin-bottom: 12px;
        }

        .res-card-categorie {
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.14);
          color: var(--electric);
          font-weight: 700;
        }

        .res-card h2 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20px;
          margin: 0 0 8px;
        }

        .res-card p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--slate);
          margin: 0;
        }
      `}</style>

      <nav className="res-nav">
        <Link href="/">
          ArtiCall<em> AI</em>
        </Link>
      </nav>

      <div className="res-container">
        <Link href="/#ressources" className="res-back">
          ← Retour à l'accueil
        </Link>

        <h1 className="res-title">Ressources</h1>
        <p className="res-subtitle">
          Guides et conseils pratiques pour artisans — gestion d'activité,
          organisation, relation client.
        </p>

        <div className="res-liste">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/ressources/${article.slug}`}
              className="res-card"
            >
              <div className="res-card-meta">
                <span className="res-card-categorie">
                  {article.categorie}
                </span>
                <span>{formatDate(article.datePublication)}</span>
                <span>· {article.tempsLecture} de lecture</span>
              </div>

              <h2>{article.titre}</h2>
              <p>{article.extrait}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}