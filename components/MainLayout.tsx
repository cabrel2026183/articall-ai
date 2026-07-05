"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

type MainLayoutProps = {
  children: React.ReactNode;
  user?: any;
  role?: string;
};

export default function MainLayout({
  children,
  user,
  role,
}: MainLayoutProps) {
  const pathname = usePathname();

  async function deconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const linkStyle = (active: boolean): React.CSSProperties => ({
    padding: "12px 14px",
    borderRadius: "10px",
    textDecoration: "none",
    color: "white",
    background: active ? "#2563eb" : "transparent",
    fontWeight: active ? "bold" : "normal",
    display: "block",
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <aside
        style={{
          width: "260px",
          padding: "22px",
          background: "#0f172a",
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "28px" }}>ArtiCall AI</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Assistant IA<br />pour artisans
          </p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/" style={linkStyle(pathname === "/")}>
            🏠 Tableau de bord
          </Link>

          <Link href="/" style={linkStyle(pathname === "/interventions")}>
            📋 Interventions
          </Link>

          <Link href="/clients" style={linkStyle(pathname === "/clients")}>
            👥 Clients
          </Link>

          <Link href="/calendrier" style={linkStyle(pathname === "/calendrier")}>
            📅 Calendrier
          </Link>

          <Link href="/facturation" style={linkStyle(pathname === "/facturation")}>
            💰 Facturation
          </Link>

          <Link href="/statistiques" style={linkStyle(pathname === "/statistiques")}>
            📊 Statistiques
          </Link>

          <Link href="/parametres" style={linkStyle(pathname === "/parametres")}>
            ⚙️ Paramètres
          </Link>
        </nav>

        <div style={{ marginTop: "auto", borderTop: "1px solid #334155", paddingTop: "20px" }}>
          {user && (
            <>
              <p style={{ margin: 0, fontWeight: "bold" }}>
                👤 {user.email}
              </p>

              <p style={{ color: role === "admin" ? "#38bdf8" : "#22c55e" }}>
                {role === "admin" ? "👑 Administrateur" : "👷 Technicien"}
              </p>
            </>
          )}

          <button
            onClick={deconnexion}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}