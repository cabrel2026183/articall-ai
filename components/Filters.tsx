"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Technician = {
  id: string;
  name: string;
};

type FiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  filtreUrgence: string;
  setFiltreUrgence: (value: string) => void;
  filtreTechnicien: string;
  setFiltreTechnicien: (value: string) => void;
};

export default function Filters({
  search,
  setSearch,
  filtreUrgence,
  setFiltreUrgence,
  filtreTechnicien,
  setFiltreTechnicien,
}: FiltersProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  useEffect(() => {
    async function chargerTechniciens() {
      const { data, error } = await supabase
        .from("technicians")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error(
          "Erreur chargement techniciens :",
          error
        );
        return;
      }

      setTechnicians(data || []);
    }

    chargerTechniciens();
  }, []);

  return (
    <>
      <input
        type="text"
        placeholder="Rechercher par nom ou téléphone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "300px",
          padding: "8px",
          marginBottom: "20px",
        }}
      />

      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button onClick={() => setFiltreUrgence("tous")}>Tous</button>
          <button onClick={() => setFiltreUrgence("urgent")}>🔴 Urgents</button>
          <button onClick={() => setFiltreUrgence("important")}>🟠 Importants</button>
          <button onClick={() => setFiltreUrgence("normal")}>🟢 Normaux</button>
        </div>

        <select
          value={filtreTechnicien}
          onChange={(e) => setFiltreTechnicien(e.target.value)}
          style={{
            marginBottom: "15px",
            padding: "8px",
          }}
        >
          <option value="tous">Tous les techniciens</option>

          {technicians.map((tech) => (
            <option key={tech.id} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}