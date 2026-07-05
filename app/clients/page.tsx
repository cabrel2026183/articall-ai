"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { supabase } from "../../lib/supabase";
import ClientsTable from "../../components/ClientsTable";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    chargerClients();
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

    const uniques = new Map();

    data?.forEach((call) => {
      if (!uniques.has(call.client_phone)) {
        uniques.set(call.client_phone, {
          client_name: call.client_name,
          client_phone: call.client_phone,
          client_email: call.client_email,
          address: call.address,
        });
      }
    });

    setClients(Array.from(uniques.values()));
  }

  return (
  <MainLayout>
    <h1>👥 Clients</h1>

    <ClientsTable clients={clients} />
  </MainLayout>
);
}