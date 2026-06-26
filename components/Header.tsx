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

      <p>
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