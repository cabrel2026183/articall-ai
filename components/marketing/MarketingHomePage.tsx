"use client";

import { useState } from "react";
import Link from "next/link";

import type { Trade } from "../../lib/types";
import DynamicCallWorkflow from "../call/DynamicCallWorkflow";
import { ARTICLES } from "../../lib/articles";

const METIERS: {
  valeur: Trade;
  icone: string;
  nom: string;
  description: string;
}[] = [
  {
    valeur: "plomberie",
    icone: "🔧",
    nom: "Plomberie",
    description:
      "Fuites, canalisations bouchées, robinetterie, chauffe-eau : un questionnaire de diagnostic complet, avec détection automatique à partir de la description du client.",
  },
  {
    valeur: "electricien",
    icone: "⚡",
    nom: "Électricité",
    description:
      "Pannes, disjoncteurs, installations. Les situations à risque (odeur de brûlé, choc électrique) sont détectées et orientées en urgence avec consignes de sécurité immédiates.",
  },
  {
    valeur: "serrurier",
    icone: "🔑",
    nom: "Serrurerie",
    description:
      "Portes claquées, clés cassées ou perdues, effractions. Chaque cas sensible déclenche les bonnes consignes avant même l'arrivée du technicien.",
  },
  {
    valeur: "chauffagiste",
    icone: "🔥",
    nom: "Chauffage",
    description:
      "Pannes, fuites, entretien. Les situations à risque (odeur de gaz, flamme anormale) sont isolées et traitées en priorité absolue.",
  },
];

const ETAPES = [
  {
    numero: "1",
    titre: "Le client appelle",
    description:
      "L'appel arrive sur votre ligne habituelle, renvoyée vers ArtiCall AI en cas de non-réponse — vous gardez votre numéro et votre opérateur.",
  },
  {
    numero: "2",
    titre: "Le diagnostic se fait",
    description:
      "Un questionnaire adapté au métier qualifie le problème, évalue l'urgence, et donne les premières consignes de sécurité si nécessaire.",
  },
  {
    numero: "3",
    titre: "L'intervention se prépare",
    description:
      "Devis, planning technicien, matériel recommandé : tout est prêt avant même que votre technicien ne prenne la route.",
  },
  {
    numero: "4",
    titre: "Vous facturez en un clic",
    description:
      "Du devis à la facture détaillée (HT/TVA/TTC), tout reste dans ArtiCall AI — plus de ressaisie, plus de papier perdu.",
  },
];

const ATOUTS = [
  {
    icone: "📞",
    titre: "Ne manquez plus jamais un appel",
    description:
      "Chaque appel manqué est automatiquement pris en charge, qualifié, et transformé en opportunité plutôt qu'en client perdu.",
  },
  {
    icone: "🤖",
    titre: "Diagnostic assisté par IA",
    description:
      "Des questionnaires construits avec de vrais professionnels, par métier, avec détection automatique des cas urgents.",
  },
  {
    icone: "🗓️",
    titre: "Planning technicien intégré",
    description:
      "Vue jour et semaine, glisser-déposer pour réassigner une intervention en un geste.",
  },
  {
    icone: "🧾",
    titre: "Devis et factures automatisés",
    description:
      "Numérotation automatique, calculs HT/TVA/TTC, tout généré à partir du diagnostic initial.",
  },
];

const FAQS = [
  {
    question: "Dois-je changer de numéro de téléphone ou d'opérateur ?",
    reponse:
      "Non. Vous gardez votre numéro et votre opérateur actuel — il suffit d'activer un renvoi d'appel conditionnel (si pas de réponse) vers votre ligne ArtiCall AI.",
  },
  {
    question: "Quels métiers sont couverts aujourd'hui ?",
    reponse:
      "Plomberie, électricité, serrurerie et chauffage sont disponibles dès maintenant, chacun avec son propre questionnaire de diagnostic. D'autres métiers arrivent progressivement.",
  },
  {
    question: "Mes données sont-elles partagées avec d'autres entreprises ?",
    reponse:
      "Non. Vos clients, interventions, devis et factures sont strictement cloisonnés à votre entreprise — aucune autre entreprise cliente d'ArtiCall AI n'y a accès.",
  },
  {
    question: "Puis-je ajouter plusieurs techniciens ?",
    reponse:
      "Oui, sans limite. Chaque technicien a son propre accès, avec une vue adaptée à son rôle, et son planning individuel.",
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    reponse:
      "Les conditions précises (durée, résiliation) seront confirmées avant le lancement commercial — contactez-nous pour être informé en priorité.",
  },
];

export default function MarketingHomePage() {
  const [etapeMetierIndex, setEtapeMetierIndex] = useState(0);
  const [demoMetier, setDemoMetier] = useState<Trade | null>(null);
  const [faqOuverte, setFaqOuverte] = useState<number | null>(0);

  return (
    <div className="mkt-page">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap");

        .mkt-page {
          --ink: #0b1220;
          --indigo: #16244a;
          --electric: #3b82f6;
          --copper: #ea8c55;
          --paper: #f8fafc;
          --slate: #94a3b8;

          font-family: "Inter", system-ui, sans-serif;
          background: var(--ink);
          color: var(--paper);
          overflow-x: hidden;
        }

        .mkt-page section {
          scroll-margin-top: 90px;
        }

        .mkt-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          background: rgba(11, 18, 32, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .mkt-nav-wordmark {
          font-family: "Space Grotesk", sans-serif;
          font-size: 19px;
          font-weight: 800;
        }

        .mkt-nav-wordmark em {
          font-style: normal;
          color: var(--electric);
        }

        .mkt-nav-links {
          display: none;
          align-items: center;
          gap: 28px;
        }

        @media (min-width: 960px) {
          .mkt-nav-links {
            display: flex;
          }
        }

        .mkt-nav-links a {
          font-size: 14px;
          font-weight: 600;
          color: var(--slate);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .mkt-nav-links a:hover {
          color: var(--paper);
        }

        .mkt-nav-cta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mkt-btn-ghost {
          padding: 9px 18px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: transparent;
          color: var(--paper);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .mkt-btn-ghost:hover {
          border-color: var(--electric);
          background: rgba(59, 130, 246, 0.1);
        }

        .mkt-btn-primary {
          padding: 9px 18px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, var(--electric), #1d4ed8);
          color: white;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: filter 0.15s ease;
        }

        .mkt-btn-primary:hover {
          filter: brightness(1.08);
        }

        .mkt-btn-primary.large {
          padding: 14px 26px;
          font-size: 15px;
        }

        .mkt-btn-ghost.large {
          padding: 14px 26px;
          font-size: 15px;
        }

        .mkt-hero {
          position: relative;
          padding: 90px 40px 100px;
          background: radial-gradient(
              circle at 15% 20%,
              rgba(59, 130, 246, 0.22),
              transparent 45%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(234, 140, 85, 0.16),
              transparent 50%
            );
        }

        .mkt-hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 48px;
        }

        .mkt-hero-text {
          flex: 1;
          min-width: 0;
          text-align: center;
        }

        @media (min-width: 1000px) {
          .mkt-hero-text {
            text-align: left;
          }
        }

        .mkt-hero-illustration {
          flex-shrink: 0;
          width: 380px;
          display: none;
        }

        @media (min-width: 1000px) {
          .mkt-hero-illustration {
            display: block;
          }
        }

        .mkt-hero-illustration svg {
          width: 100%;
          height: auto;
          opacity: 0.6;
        }

        .mkt-hero-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: var(--electric);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .mkt-hero h1 {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(32px, 6vw, 58px);
          line-height: 1.1;
          font-weight: 700;
          margin: 0 auto 20px;
        }

        .mkt-hero h1 em {
          font-style: normal;
          background: linear-gradient(90deg, var(--electric), #93c5fd);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .mkt-hero p {
          font-size: 17px;
          line-height: 1.6;
          color: var(--slate);
          max-width: 560px;
          margin: 0 auto 36px;
        }

        @media (min-width: 1000px) {
          .mkt-hero h1,
          .mkt-hero p {
            margin-left: 0;
            margin-right: 0;
          }
        }

        .mkt-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        @media (min-width: 1000px) {
          .mkt-hero-actions {
            justify-content: flex-start;
          }
        }

        .mkt-section {
          padding: 90px 40px;
          max-width: 1140px;
          margin: 0 auto;
        }

        .mkt-section-eyebrow {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--electric);
          margin-bottom: 12px;
          text-align: center;
        }

        .mkt-section-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 700;
          text-align: center;
          margin: 0 0 16px;
        }

        .mkt-section-subtitle {
          font-size: 16px;
          color: var(--slate);
          text-align: center;
          max-width: 560px;
          margin: 0 auto 56px;
          line-height: 1.6;
        }

        .mkt-etapes {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
        }

        .mkt-etape {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          padding: 26px 22px;
        }

        .mkt-etape-numero {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.15);
          color: var(--electric);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Space Grotesk", sans-serif;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .mkt-etape h3 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 17px;
          margin: 0 0 8px;
        }

        .mkt-etape p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--slate);
          margin: 0;
        }

        .mkt-demo-contact {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--slate);
        }

        .mkt-demo-contact a {
          color: var(--electric);
          font-weight: 700;
          text-decoration: none;
        }

        .mkt-demo-contact a:hover {
          text-decoration: underline;
        }

        .mkt-demo-intro {
          text-align: center;
          margin-bottom: 32px;
        }

        .mkt-demo-card {
          max-width: 640px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 20px;
          padding: 32px;
        }

        .mkt-metiers-tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        .mkt-metier-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(255, 255, 255, 0.02);
          color: var(--slate);
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .mkt-metier-tab.actif {
          border-color: var(--electric);
          background: rgba(59, 130, 246, 0.12);
          color: var(--paper);
        }

        .mkt-metier-detail {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          max-width: 640px;
          margin: 0 auto;
        }

        .mkt-metier-detail-icone {
          font-size: 44px;
          margin-bottom: 16px;
        }

        .mkt-metier-detail h3 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 22px;
          margin: 0 0 12px;
        }

        .mkt-metier-detail p {
          color: var(--slate);
          font-size: 15px;
          line-height: 1.7;
          margin: 0;
        }

        .mkt-atouts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .mkt-atout {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          padding: 28px 24px;
        }

        .mkt-atout-icone {
          font-size: 28px;
          margin-bottom: 14px;
        }

        .mkt-atout h3 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 16px;
          margin: 0 0 8px;
        }

        .mkt-atout p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--slate);
          margin: 0;
        }

        .mkt-tarif-card {
          max-width: 420px;
          margin: 0 auto;
          background: linear-gradient(
            160deg,
            rgba(59, 130, 246, 0.12),
            rgba(255, 255, 255, 0.02)
          );
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 22px;
          padding: 40px 34px;
          text-align: center;
        }

        .mkt-tarif-indicatif {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(234, 140, 85, 0.15);
          border: 1px solid rgba(234, 140, 85, 0.35);
          color: var(--copper);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .mkt-tarif-prix {
          font-family: "Space Grotesk", sans-serif;
          font-size: 42px;
          font-weight: 700;
          margin: 0 0 4px;
        }

        .mkt-tarif-prix span {
          font-size: 16px;
          font-weight: 600;
          color: var(--slate);
        }

        .mkt-tarif-installation {
          color: var(--slate);
          font-size: 14px;
          margin-bottom: 24px;
        }

        .mkt-tarif-liste {
          list-style: none;
          padding: 0;
          margin: 0 0 28px;
          text-align: left;
          display: grid;
          gap: 12px;
        }

        .mkt-tarif-liste li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: var(--paper);
        }

        .mkt-tarif-liste li::before {
          content: "✓";
          color: var(--electric);
          font-weight: 700;
          flex-shrink: 0;
        }

        .mkt-tarif-note {
          font-size: 12px;
          color: var(--slate);
          margin-top: 16px;
        }

        .mkt-faq-liste {
          max-width: 720px;
          margin: 0 auto;
          display: grid;
          gap: 12px;
        }

        .mkt-faq-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 14px;
          overflow: hidden;
        }

        .mkt-faq-question {
          width: 100%;
          text-align: left;
          padding: 18px 22px;
          background: transparent;
          border: none;
          color: var(--paper);
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .mkt-faq-question-icone {
          flex-shrink: 0;
          color: var(--electric);
          font-size: 18px;
          transition: transform 0.25s ease;
        }

        .mkt-faq-question-icone.ouvert {
          transform: rotate(45deg);
        }

        .mkt-faq-reponse {
          padding: 0 22px 20px;
          color: var(--slate);
          font-size: 14px;
          line-height: 1.7;
        }

        .mkt-ressources-card {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(148, 163, 184, 0.25);
          border-radius: 18px;
          padding: 40px;
        }

        .mkt-ressources-card p {
          color: var(--slate);
          font-size: 14px;
          margin: 8px 0 0;
        }

        .mkt-contact-card {
          max-width: 520px;
          margin: 0 auto;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          padding: 40px;
        }

        .mkt-contact-card a {
          color: var(--electric);
          font-weight: 700;
          text-decoration: none;
          font-size: 16px;
        }

        .mkt-footer {
          padding: 32px 40px;
          text-align: center;
          color: var(--slate);
          font-size: 13px;
          border-top: 1px solid rgba(148, 163, 184, 0.12);
        }

        .mkt-footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .mkt-footer-links a {
          color: var(--slate);
          text-decoration: none;
        }

        .mkt-footer-links a:hover {
          color: var(--paper);
        }
      `}</style>

      <nav className="mkt-nav">
        <div className="mkt-nav-wordmark">
          ArtiCall<em> AI</em>
        </div>

        <div className="mkt-nav-links">
          <a href="#fonctionnalites">Comment ça marche</a>
          <a href="#demo">Démo</a>
          <a href="#metiers">Métiers</a>
          <a href="#pourquoi">Pourquoi nous</a>
          <a href="#tarifs">Tarifs</a>
          <a href="#faq">FAQ</a>
          <a href="#ressources">Ressources</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="mkt-nav-cta">
          <Link href="/login" className="mkt-btn-ghost">
            Connexion
          </Link>
          <Link href="/login" className="mkt-btn-primary">
            Essayer
          </Link>
        </div>
      </nav>

      <section className="mkt-hero">
        <div className="mkt-hero-inner">
          <div className="mkt-hero-text">
            <span className="mkt-hero-badge">
              Assistant IA pour artisans
            </span>

            <h1>
              L'appel arrive. Le diagnostic se fait.{" "}
              <em>L'intervention se planifie.</em>
            </h1>

            <p>
              Plomberie, électricité, serrurerie, chauffage : ArtiCall AI
              qualifie chaque appel client et prépare vos techniciens
              avant même leur arrivée sur place.
            </p>

            <div className="mkt-hero-actions">
              <Link href="/login" className="mkt-btn-primary large">
                Essayer ArtiCall AI
              </Link>
              <a href="#fonctionnalites" className="mkt-btn-ghost large">
                Voir comment ça marche
              </a>
            </div>
          </div>

          <div className="mkt-hero-illustration">
            <svg viewBox="0 0 240 240" aria-hidden="true">
              <circle
                cx="120"
                cy="120"
                r="112"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="1.5"
                strokeDasharray="3 7"
                opacity="0.5"
              />
              <path
                d="M70 118 a50 50 0 0 1 100 0"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect
                x="63"
                y="112"
                width="12"
                height="24"
                rx="6"
                fill="#3B82F6"
              />
              <rect
                x="165"
                y="112"
                width="12"
                height="24"
                rx="6"
                fill="#3B82F6"
              />
              <path
                d="M171 136 v10 a8 8 0 0 1 -8 8 h-10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="151" cy="154" r="4" fill="#EA8C55" />
              <circle
                cx="120"
                cy="112"
                r="38"
                fill="rgba(59,130,246,0.10)"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />
              <path
                d="M82 100 a38 38 0 0 1 76 0 h-10 q-28 -14 -56 0 Z"
                fill="#16244A"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect
                x="76"
                y="98"
                width="20"
                height="8"
                rx="4"
                fill="#16244A"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              <path
                d="M56 230 Q60 165 120 160 Q180 165 184 230 Z"
                fill="rgba(22,36,74,0.55)"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M104 168 L120 184 L136 168"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g transform="translate(150 178) rotate(28)">
                <rect
                  x="-5"
                  y="0"
                  width="10"
                  height="46"
                  rx="4"
                  fill="#EA8C55"
                />
                <path
                  d="M-11 -4 a11 11 0 1 1 22 0 a11 11 0 0 1 -8 10.5 v4 h-6 v-4 a11 11 0 0 1 -8 -10.5 Z"
                  fill="#EA8C55"
                />
                <rect
                  x="-9"
                  y="-6"
                  width="18"
                  height="7"
                  rx="2"
                  fill="#16244A"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mkt-section">
        <span className="mkt-section-eyebrow">Comment ça marche</span>
        <h2 className="mkt-section-title">
          De l'appel manqué à la facture, sans ressaisie
        </h2>
        <p className="mkt-section-subtitle">
          Quatre étapes, entièrement intégrées, du premier contact avec
          le client jusqu'au paiement de la facture.
        </p>

        <div className="mkt-etapes">
          {ETAPES.map((etape) => (
            <div className="mkt-etape" key={etape.numero}>
              <div className="mkt-etape-numero">{etape.numero}</div>
              <h3>{etape.titre}</h3>
              <p>{etape.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="mkt-section">
        <span className="mkt-section-eyebrow">Testez-le vous-même</span>
        <h2 className="mkt-section-title">Le diagnostic, en direct</h2>

        <div className="mkt-demo-intro">
          <p
            className="mkt-section-subtitle"
            style={{ marginBottom: "28px" }}
          >
            Choisissez un métier et répondez comme le ferait un client au
            téléphone — aucune inscription nécessaire.
          </p>

          <div className="mkt-metiers-tabs">
            {METIERS.map((metier) => (
              <button
                key={metier.valeur}
                type="button"
                onClick={() => setDemoMetier(metier.valeur)}
                className={
                  "mkt-metier-tab" +
                  (demoMetier === metier.valeur ? " actif" : "")
                }
              >
                <span>{metier.icone}</span>
                {metier.nom}
              </button>
            ))}
          </div>
        </div>

        {demoMetier && (
          <div className="mkt-demo-card">
            <DynamicCallWorkflow
              key={demoMetier}
              trade={demoMetier}
              propertyType="maison"
            />
          </div>
        )}

        <p className="mkt-demo-contact">
          Envie d'une démo complète guidée ?{" "}
          <a href="#contact">Contactez-nous</a>
        </p>
      </section>

      <section id="metiers" className="mkt-section">
        <span className="mkt-section-eyebrow">Métiers couverts</span>
        <h2 className="mkt-section-title">
          Un diagnostic pensé pour chaque métier
        </h2>
        <p className="mkt-section-subtitle">
          Chaque questionnaire est construit spécifiquement pour son
          métier — pas de questions génériques hors sujet.
        </p>

        <div className="mkt-metiers-tabs">
          {METIERS.map((metier, index) => (
            <button
              key={metier.nom}
              type="button"
              onClick={() => setEtapeMetierIndex(index)}
              className={
                "mkt-metier-tab" +
                (index === etapeMetierIndex ? " actif" : "")
              }
            >
              <span>{metier.icone}</span>
              {metier.nom}
            </button>
          ))}
        </div>

        <div className="mkt-metier-detail">
          <div className="mkt-metier-detail-icone">
            {METIERS[etapeMetierIndex].icone}
          </div>
          <h3>{METIERS[etapeMetierIndex].nom}</h3>
          <p>{METIERS[etapeMetierIndex].description}</p>
        </div>
      </section>

      <section id="pourquoi" className="mkt-section">
        <span className="mkt-section-eyebrow">Pourquoi ArtiCall AI</span>
        <h2 className="mkt-section-title">
          Tout ce dont un artisan a besoin, au même endroit
        </h2>
        <p className="mkt-section-subtitle">
          Pas un énième outil à côté des autres — une seule plateforme,
          de l'appel jusqu'au paiement.
        </p>

        <div className="mkt-atouts">
          {ATOUTS.map((atout) => (
            <div className="mkt-atout" key={atout.titre}>
              <div className="mkt-atout-icone">{atout.icone}</div>
              <h3>{atout.titre}</h3>
              <p>{atout.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tarifs" className="mkt-section">
        <span className="mkt-section-eyebrow">Tarifs</span>
        <h2 className="mkt-section-title">Une offre simple</h2>
        <p className="mkt-section-subtitle">
          Une installation, un abonnement mensuel — sans surprise.
        </p>

        <div className="mkt-tarif-card">
          <span className="mkt-tarif-indicatif">
            Tarif indicatif — à confirmer
          </span>

          <div className="mkt-tarif-prix">
            49€<span> / mois</span>
          </div>

          <div className="mkt-tarif-installation">
            + 199€ d'installation, sans engagement de durée
          </div>

          <ul className="mkt-tarif-liste">
            <li>Diagnostic assisté par IA, tous métiers disponibles</li>
            <li>Techniciens illimités</li>
            <li>Devis et factures illimités</li>
            <li>Planning technicien intégré</li>
            <li>Support par email</li>
          </ul>

          <Link href="/login" className="mkt-btn-primary large">
            Essayer ArtiCall AI
          </Link>

          <p className="mkt-tarif-note">
            Prix communiqués à titre indicatif, susceptibles d'évoluer
            avant le lancement commercial officiel.
          </p>
        </div>
      </section>

      <section id="faq" className="mkt-section">
        <span className="mkt-section-eyebrow">Questions fréquentes</span>
        <h2 className="mkt-section-title">FAQ</h2>
        <p className="mkt-section-subtitle">
          Les questions les plus courantes — contactez-nous si la vôtre
          n'y figure pas.
        </p>

        <div className="mkt-faq-liste">
          {FAQS.map((faq, index) => {
            const estOuverte = faqOuverte === index;

            return (
              <div className="mkt-faq-item" key={faq.question}>
                <button
                  type="button"
                  className="mkt-faq-question"
                  onClick={() =>
                    setFaqOuverte(estOuverte ? null : index)
                  }
                >
                  {faq.question}
                  <span
                    className={
                      "mkt-faq-question-icone" +
                      (estOuverte ? " ouvert" : "")
                    }
                  >
                    +
                  </span>
                </button>

                {estOuverte && (
                  <div className="mkt-faq-reponse">{faq.reponse}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="ressources" className="mkt-section">
        <span className="mkt-section-eyebrow">Ressources</span>
        <h2 className="mkt-section-title">
          Guides et conseils pour artisans
        </h2>
        <p className="mkt-section-subtitle">
          Gestion d'activité, organisation, relation client — des articles
          pratiques, sans jargon.
        </p>

        <div className="mkt-atouts">
          {ARTICLES.slice(0, 3).map((article) => (
            <Link
              key={article.slug}
              href={`/ressources/${article.slug}`}
              className="mkt-atout"
              style={{ textDecoration: "none", display: "block" }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--electric)",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {article.categorie}
              </div>
              <h3>{article.titre}</h3>
              <p>{article.extrait}</p>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "36px" }}>
          <Link href="/ressources" className="mkt-btn-ghost">
            Voir tous les articles
          </Link>
        </div>
      </section>

      <section id="contact" className="mkt-section">
        <span className="mkt-section-eyebrow">Contact</span>
        <h2 className="mkt-section-title">Une question ?</h2>

        <div className="mkt-contact-card">
          <p style={{ color: "var(--slate)", marginBottom: "16px" }}>
            Écrivez-nous, nous vous répondons rapidement.
          </p>
          <a href="mailto:contact@articallai.fr">
            contact@articallai.fr
          </a>
        </div>
      </section>

      <footer className="mkt-footer">
        © {new Date().getFullYear()} ArtiCall AI — Assistant IA pour
        artisans.
        <div className="mkt-footer-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">
            Politique de confidentialité
          </Link>
          <Link href="/cgu">CGU/CGV</Link>
        </div>
      </footer>
    </div>
  );
}