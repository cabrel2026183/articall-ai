"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../../lib/supabase";
import type { Invoice } from "../../lib/types";

type RevenuePoint = {
  day: string;
  revenue: number;
};

type InvoiceRevenue = Pick<Invoice, "created_at" | "total_amount">;

export default function RevenueChart() {
  const [data, setData] = useState<RevenuePoint[]>([]);

  useEffect(() => {
    chargerChiffreAffaires();
  }, []);

  async function chargerChiffreAffaires() {
    const { data: invoicesData, error } = await supabase
      .from("invoices")
      .select("created_at, total_amount")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "Erreur chargement chiffre d'affaires :",
        error
      );
      setData([]);
      return;
    }

    const parJour = new Map<string, number>();

    ((invoicesData as InvoiceRevenue[]) || []).forEach((invoice) => {
      if (!invoice.created_at) return;

      const day = new Date(invoice.created_at).toLocaleDateString(
        "fr-FR",
        {
          day: "2-digit",
          month: "short",
        }
      );

      parJour.set(
        day,
        (parJour.get(day) || 0) + Number(invoice.total_amount || 0)
      );
    });

    setData(
      Array.from(parJour.entries()).map(([day, revenue]) => ({
        day,
        revenue,
      }))
    );
  }

  return (
    <div style={{ width: "100%", height: "280px" }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis dataKey="day" />
          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#revenueColor)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}