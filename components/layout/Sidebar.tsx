"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../../lib/supabase";
import type { AuthUser } from "../../lib/types";

type SidebarProps = {
  user?: AuthUser | null;
  role?: string;
};

export default function Sidebar({ user, role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "admin";
const isTechnician = role === "technicien";

  async function deconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function routeActive(route: string) {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  }

  const linkStyle = (
    active: boolean
  ): React.CSSProperties => ({
    padding: "12px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "white",
    background: active ? "#2563eb" : "transparent",
    fontWeight: active ? "700" : "500",
    display: "block",
    transition: "background 0.2s ease",
  });

  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        padding: "24px",
        background: "#0f172a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "26px",
          }}
        >
          🛠️ ArtiCall AI
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          Assistant IA
          <br />
          pour artisans
        </p>
      </div>

      <nav
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }}
>
  <Link
    href="/"
    style={linkStyle(routeActive("/"))}
  >
    🏠 Tableau de bord
  </Link>

  <Link
    href="/interventions"
    style={linkStyle(routeActive("/interventions"))}
  >
    {isTechnician
      ? "📋 Mes interventions"
      : "📋 Interventions"}
  </Link>

  <Link
    href="/calendrier"
    style={linkStyle(routeActive("/calendrier"))}
  >
    {isTechnician
      ? "📅 Mon planning"
      : "📅 Calendrier"}
  </Link>

  {isAdmin && (
    <>
      <Link
        href="/planning"
        style={linkStyle(routeActive("/planning"))}
      >
        🗓️ Planning technicien
      </Link>

      <Link
        href="/clients"
        style={linkStyle(routeActive("/clients"))}
      >
        👥 Clients
      </Link>

      <Link
        href="/techniciens"
        style={linkStyle(routeActive("/techniciens"))}
      >
        👷 Techniciens
      </Link>

      <Link
        href="/devis"
        style={linkStyle(routeActive("/devis"))}
      >
        📄 Devis
      </Link>

      <Link
        href="/factures"
        style={linkStyle(routeActive("/factures"))}
      >
        💰 Factures
      </Link>

      <Link
        href="/tarifs"
        style={linkStyle(routeActive("/tarifs"))}
      >
        💶 Mes tarifs
      </Link>

      <Link
        href="/statistiques"
        style={linkStyle(routeActive("/statistiques"))}
      >
        📊 Statistiques
      </Link>

      <div
        style={{
          borderTop: "1px solid #334155",
          marginTop: "10px",
          paddingTop: "10px",
        }}
      >
        <p
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "700",
            margin: "0 0 8px 14px",
            textTransform: "uppercase",
          }}
        >
          Configuration
        </p>

        <Link
          href="/parametres"
          style={linkStyle(routeActive("/parametres"))}
        >
          ⚙️ Paramètres
        </Link>
      </div>
    </>
  )}
</nav>

      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid #334155",
          paddingTop: "20px",
        }}
      >
        {user && (
          <>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#cbd5e1",
                overflowWrap: "anywhere",
              }}
            >
              👤 {user.email}
            </p>

            <p
              style={{
                color:
                  role === "admin"
                    ? "#38bdf8"
                    : "#22c55e",
                fontWeight: "700",
              }}
            >
              {role === "admin"
                ? "👑 Administrateur"
                : "👷 Technicien"}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={deconnexion}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
}