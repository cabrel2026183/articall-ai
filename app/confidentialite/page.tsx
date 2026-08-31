"use client";

import Link from "next/link";

export default function ConfidentialitePage() {
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

        .legal-container ul {
          padding-left: 20px;
          margin: 12px 0;
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
          un professionnel du droit avant toute mise en ligne officielle,
          notamment pour garantir sa conformité complète au RGPD.
        </div>

        <h1>Politique de confidentialité</h1>

        <p>
          Cette politique explique quelles données personnelles ArtiCall
          AI collecte, pourquoi, et comment vous pouvez exercer vos
          droits.
        </p>

        <h2>Responsable du traitement</h2>
        <p>
          <span className="placeholder">
            [Nom et prénom de l'auto-entrepreneur]
          </span>
          , contactable à l'adresse{" "}
          <span className="placeholder">
            [Adresse e-mail de contact]
          </span>
          .
        </p>

        <h2>Données collectées</h2>
        <p>ArtiCall AI collecte deux types de données :</p>
        <ul>
          <li>
            <strong>Données des utilisateurs du logiciel</strong> (les
            entreprises artisanales et leurs employés) : nom, e-mail,
            téléphone, rôle dans l'entreprise.
          </li>
          <li>
            <strong>Données des clients finaux</strong>, saisies par les
            entreprises utilisatrices dans le cadre de leur activité :
            nom, téléphone, e-mail, adresse d'intervention.
          </li>
        </ul>

        <h2>Finalité du traitement</h2>
        <p>
          Ces données sont utilisées exclusivement pour permettre le
          fonctionnement du logiciel : gestion des appels, diagnostics,
          interventions, devis et factures. Elles ne sont ni vendues, ni
          cédées à des tiers à des fins commerciales.
        </p>

        <h2>Base légale</h2>
        <p>
          Le traitement des données repose sur l'exécution du contrat
          liant ArtiCall AI à l'entreprise utilisatrice (fourniture du
          service), ainsi que, le cas échéant, sur l'intérêt légitime à
          assurer la sécurité et le bon fonctionnement du service.
        </p>

        <h2>Sous-traitants techniques</h2>
        <p>
          ArtiCall AI fait appel aux prestataires suivants pour héberger
          et faire fonctionner le service :
        </p>
        <ul>
          <li>
            <strong>Supabase Inc.</strong> — hébergement de la base de
            données.
          </li>
          <li>
            <strong>Vercel Inc.</strong> — hébergement de l'application.
          </li>
        </ul>

        <h2>Cloisonnement des données</h2>
        <p>
          Les données de chaque entreprise cliente sont strictement
          séparées de celles des autres entreprises utilisant ArtiCall
          AI — aucune entreprise n'a accès aux données d'une autre.
        </p>

        <h2>Durée de conservation</h2>
        <p>
          Les données sont conservées pendant toute la durée d'utilisation
          du service, puis supprimées ou archivées conformément aux
          obligations légales applicables (notamment comptables et
          fiscales) après résiliation.
        </p>

        <h2>Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des
          Données (RGPD), vous disposez d'un droit d'accès, de
          rectification, d'effacement, de limitation et d'opposition
          concernant vos données personnelles. Pour exercer ces droits,
          contactez-nous à{" "}
          <span className="placeholder">
            [Adresse e-mail de contact]
          </span>
          .
        </p>

        <h2>Cookies</h2>
        <p>
          Le site utilise uniquement des cookies techniques nécessaires
          au fonctionnement du service (authentification), sans
          traceurs publicitaires ni analytiques tiers à ce jour.
        </p>
      </div>
    </div>
  );
}