"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RevenueChartProps = {
  calls: any[];
};

export default function RevenueChart({ calls }: RevenueChartProps) {
  const data = Object.values(
    calls.reduce((acc: any, call) => {
      if (!call.created_at) return acc;

      const date = new Date(call.created_at);

      const day = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });

      if (!acc[day]) {
        acc[day] = {
          day,
          revenue: 0,
        };
      }

      acc[day].revenue += call.amount || 0;

      return acc;
    }, {})
  );

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