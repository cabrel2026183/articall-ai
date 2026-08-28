"use client";

import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import type { AuthUser, Call } from "../lib/types";

type MainLayoutProps = {
  children: React.ReactNode;
  user?: AuthUser | null;
  role?: string;
  calls?: Call[];
};

export default function MainLayout({
  children,
  user,
  role,
  calls = [],
}: MainLayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Sidebar user={user} role={role} />

      <div style={{ flex: 1 }}>
        
        <TopBar
  user={user}
  role={role}
  calls={calls}
/>

        <main style={{ padding: "32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}