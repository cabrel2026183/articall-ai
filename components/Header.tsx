"use client";

import { supabase } from "../lib/supabase";

type HeaderProps = {
  user: any;
  role: string;
};

export default function Header({
  user,
  role,
}: HeaderProps) {
  async function deconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      <h1>ArtiCall AI</h1>

      <button onClick={deconnexion}>
        Déconnexion
      </button>

     <div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    flexWrap: "wrap",
  }}
>
  <a href="/"><button>🏠 Dashboard</button></a>

  <a href="/clients"><button>👥 Clients</button></a>

  <a href="/interventions"><button>📋 Interventions</button></a>

  <a href="/facturation"><button>💰 Facturation</button></a>

  <a href="/statistiques"><button>📊 Statistiques</button></a>
</div>

<p style={{ marginTop: "10px" }}>
  Connecté : {user?.email}
</p>

      {role === "admin" ? (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
          }}
        >
          👑 Administrateur
        </p>
      ) : (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
          }}
        >
          👷 Technicien
        </p>
      )}

      <p>
        Ne perdez plus aucun client à cause d'un appel manqué.
      </p>
    </>
  );
}