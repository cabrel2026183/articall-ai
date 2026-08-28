"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const sections = [
  {
    title: "Mon entreprise",
    description:
      "Logo, coordonnées, SIRET, numéro de TVA et couleur principale.",
    icon: "🏢",
    href: "/parametres/entreprise",
    disponible: true,
  },
  {
    title: "Utilisateurs",
    description:
      "Gérer les administrateurs, techniciens et collaborateurs.",
    icon: "👥",
    href: "/parametres/utilisateurs",
    disponible: false,
  },
  {
    title: "Intelligence artificielle",
    description:
      "Configurer les réponses automatiques et les fonctions IA.",
    icon: "🤖",
    href: "/parametres/ia",
    disponible: false,
  },
  {
    title: "Modèles PDF",
    description:
      "Personnaliser les devis, factures et rapports d’intervention.",
    icon: "📄",
    href: "/parametres/modeles-pdf",
    disponible: false,
  },
  {
    title: "Notifications",
    description:
      "Configurer les e-mails, SMS, rappels et alertes.",
    icon: "🔔",
    href: "/parametres/notifications",
    disponible: false,
  },
  {
    title: "Abonnement",
    description:
      "Consulter la formule actuelle et gérer la facturation.",
    icon: "💳",
    href: "/parametres/abonnement",
    disponible: false,
  },
  {
    title: "Sécurité",
    description:
      "Modifier le mot de passe et gérer les accès au compte.",
    icon: "🔐",
    href: "/parametres/securite",
    disponible: false,
  },
];

export default function ParametresPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function verifierAcces() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const email = user.email?.toLowerCase().trim();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      const role = profile?.role || "technicien";

      if (role !== "admin") {
        window.location.href = "/";
        return;
      }

      setCheckingAccess(false);
    }

    verifierAcces();
  }, []);

  if (checkingAccess) {
    return (
      <main style={{ padding: "32px" }}>
        Chargement...
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            margin: 0,
            color: "#0f172a",
            fontSize: "32px",
          }}
        >
          ⚙️ Paramètres
        </h1>

        <p
          style={{
            marginTop: "10px",
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          Gérez les informations et les réglages de votre espace
          ArtiCall AI.
        </p>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {sections.map((section) => {
          const contenu = (
            <>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  marginBottom: "18px",
                }}
              >
                {section.icon}
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: "20px",
                }}
              >
                {section.title}
              </h2>

              <p
                style={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  marginBottom: "18px",
                }}
              >
                {section.description}
              </p>

              <div
                style={{
                  marginTop: "auto",
                  fontWeight: "700",
                  color: section.disponible
                    ? "#2563eb"
                    : "#94a3b8",
                }}
              >
                {section.disponible
                  ? "Ouvrir les réglages →"
                  : "Bientôt disponible"}
              </div>
            </>
          );

          const styleCarte: React.CSSProperties = {
            minHeight: "230px",
            padding: "24px",
            borderRadius: "18px",
            border: "1px solid #e2e8f0",
            background: "white",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            textDecoration: "none",
            display: "flex",
            flexDirection: "column",
            transition:
              "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: section.disponible
              ? "pointer"
              : "not-allowed",
            opacity: section.disponible ? 1 : 0.72,
          };

          if (section.disponible) {
            return (
              <Link
                key={section.title}
                href={section.href}
                style={styleCarte}
              >
                {contenu}
              </Link>
            );
          }

          return (
            <div
              key={section.title}
              style={styleCarte}
            >
              {contenu}
            </div>
          );
        })}
      </section>
    </main>
  );
}