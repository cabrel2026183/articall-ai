"use client";

import Link from "next/link";

export default function CguPage() {
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
          réelles (repérables en orange ci-dessous), notamment vos
          conditions tarifaires et de résiliation définitives, et à faire
          relire par un professionnel du droit avant toute mise en ligne
          officielle.
        </div>

        <h1>Conditions générales d'utilisation et de vente</h1>

        <h2>Objet</h2>
        <p>
          Les présentes conditions régissent l'accès et l'utilisation du
          logiciel ArtiCall AI, édité par{" "}
          <span className="placeholder">
            [Nom et prénom de l'auto-entrepreneur]
          </span>
          , par les entreprises artisanales souscrivant au service.
        </p>

        <h2>Description du service</h2>
        <p>
          ArtiCall AI est un logiciel de gestion d'interventions pour
          artisans, incluant notamment : diagnostic assisté par
          intelligence artificielle, gestion des clients et
          interventions, devis, factures et planning technicien.
        </p>

        <h2>Inscription et compte</h2>
        <p>
          L'utilisation du service nécessite la création d'un compte,
          associé à une entreprise. L'utilisateur s'engage à fournir des
          informations exactes et à maintenir la confidentialité de ses
          identifiants.
        </p>

        <h2>Tarifs et facturation</h2>
        <p>
          Les tarifs applicables sont ceux affichés sur le site au
          moment de la souscription :{" "}
          <span className="placeholder">
            [Tarifs définitifs à confirmer]
          </span>
          . ArtiCall AI se réserve le droit de faire évoluer ses tarifs,
          avec un préavis raisonnable communiqué aux clients existants.
        </p>

        <h2>Durée et résiliation</h2>
        <p>
          <span className="placeholder">
            [Conditions de durée d'engagement et de résiliation à
            définir]
          </span>
          .
        </p>

        <h2>Responsabilité</h2>
        <p>
          ArtiCall AI met en œuvre les moyens raisonnables pour assurer
          la disponibilité et la sécurité du service, sans garantir une
          disponibilité absolue. L'artisan reste seul responsable des
          décisions professionnelles prises sur la base des diagnostics
          proposés par l'outil, qui a un rôle d'aide et ne remplace pas
          l'expertise du professionnel.
        </p>

        <h2>Données et confidentialité</h2>
        <p>
          Le traitement des données personnelles est détaillé dans la{" "}
          <Link
            href="/confidentialite"
            style={{ color: "var(--electric)" }}
          >
            politique de confidentialité
          </Link>
          .
        </p>

        <h2>Modification des conditions</h2>
        <p>
          Les présentes conditions peuvent être amenées à évoluer.
          Toute modification substantielle sera communiquée aux
          utilisateurs avant son entrée en vigueur.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative à ces conditions :{" "}
          <span className="placeholder">
            [Adresse e-mail de contact]
          </span>
        </p>
      </div>
    </div>
  );
}