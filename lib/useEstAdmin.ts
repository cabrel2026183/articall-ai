"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Retourne :
 *  - null  : rôle pas encore connu (on cache les montants par prudence)
 *  - true  : administrateur (voit tout)
 *  - false : technicien (ne voit aucun montant)
 */
export function useEstAdmin(): boolean | null {
  const [estAdmin, setEstAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let actif = true;

    async function verifier() {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;

      if (!userId) {
        if (actif) setEstAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (actif) {
        setEstAdmin((data as { role: string | null } | null)?.role === "admin");
      }
    }

    verifier();

    return () => {
      actif = false;
    };
  }, []);

  return estAdmin;
}