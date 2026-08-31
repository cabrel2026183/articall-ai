"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ARTICLES } from "../../../lib/articles";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = ARTICLES.find((item) => item.slug === params.slug);

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

        .res-article-container {
          max-width: 700px;
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

        .res-article-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--slate);
          margin-bottom: 16px;
        }

        .res-article-categorie {
          padding: 3px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.14);
          color: var(--electric);
          font-weight: 700;
        }

        .res-article-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 700;
          line-height: 1.2;
          margin: 0 0 32px;
        }

        .res-article-body p {
          font-size: 16px;
          line-height: 1.8;
          color: #cbd5e1;
          margin: 0 0 22px;
        }

        .res-article-cta {
          margin-top: 48px;
          padding: 28px;
          border-radius: 16px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.25);
          text-align: center;
        }

        .res-article-cta p {
          margin: 0 0 16px;
          color: var(--paper);
          font-weight: 600;
        }

        .res-article-cta a {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--electric), #1d4ed8);
          color: white;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
        }

        .res-not-found {
          text-align: center;
          padding: 100px 24px;
          color: var(--slate);
        }
      `}</style>

      <nav className="res-nav">
        <Link href="/">
          ArtiCall<em> AI</em>
        </Link>
      </nav>

      {!article ? (
        <div className="res-not-found">
          <p>Cet article n'existe pas ou a été déplacé.</p>
          <Link href="/ressources" className="res-back">
            ← Retour aux ressources
          </Link>
        </div>
      ) : (
        <div className="res-article-container">
          <Link href="/ressources" className="res-back">
            ← Retour aux ressources
          </Link>

          <div className="res-article-meta">
            <span className="res-article-categorie">
              {article.categorie}
            </span>
            <span>{formatDate(article.datePublication)}</span>
            <span>· {article.tempsLecture} de lecture</span>
          </div>

          <h1 className="res-article-title">{article.titre}</h1>

          <div className="res-article-body">
            {article.contenu.map((paragraphe, index) => (
              <p key={index}>{paragraphe}</p>
            ))}
          </div>

          <div className="res-article-cta">
            <p>
              Envie de ne plus manquer un appel, ni un rendez-vous ?
            </p>
            <Link href="/login">Essayer ArtiCall AI</Link>
          </div>
        </div>
      )}
    </div>
  );
}
