"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function inscription() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé. Vérifie ton email si Supabase demande confirmation.");
    }
  }

  async function connexion() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Connexion ArtiCall AI</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px" }}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "300px" }}
      />

      <div style={{ display: "flex", gap: "10px" }}>
  <button onClick={connexion}>
    Connexion
  </button>

  <button onClick={inscription}>
    Créer un compte
  </button>
</div>
    </main>
  );
}