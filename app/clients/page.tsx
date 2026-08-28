"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import ClientsTable from "../../components/ClientsTable";
import type { Call } from "../../lib/types";

type ClientRow = Pick<
  Call,
  "id" | "client_name" | "client_phone" | "client_email" | "address"
>;

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifierAccesEtCharger() {
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

      await chargerClients();
      setLoading(false);
    }

    verifierAccesEtCharger();
  }, []);

  async function chargerClients() {
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .order("client_name");

    if (error) {
      alert(error.message);
      return;
    }

    const uniques = new Map<string, ClientRow>();

    (data as Call[] | null)?.forEach((call) => {
      const cleClient = call.client_phone || call.client_email || call.client_name;

      if (!cleClient) return;

      if (!uniques.has(cleClient)) {
        uniques.set(cleClient, {
          id: call.id,
          client_name: call.client_name,
          client_phone: call.client_phone,
          client_email: call.client_email,
          address: call.address,
        });
      }
    });

    const clientsTries = Array.from(uniques.values()).sort((a, b) =>
      (a.client_name || "").localeCompare(b.client_name || "")
    );

    setClients(clientsTries);
  }

  if (loading) {
    return (
      <MainLayout>
        <p>Chargement...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1>👥 Clients</h1>

      <ClientsTable clients={clients} />
    </MainLayout>
  );
}