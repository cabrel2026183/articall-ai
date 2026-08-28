"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Technician = {
  id: string;
  name: string;
};

type TechnicianFieldsProps = {
  technician: string;
  setTechnician: (value: string) => void;
  setPhoto: (file: File | null) => void;
};

export default function TechnicianFields({
  technician,
  setTechnician,
  setPhoto,
}: TechnicianFieldsProps) {
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
      <select
        value={technician}
        onChange={(e) => setTechnician(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
        }}
      >
        <option value="">Aucun technicien</option>

        {technicians.map((tech) => (
          <option key={tech.id} value={tech.name}>
            {tech.name}
          </option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setPhoto(e.target.files?.[0] || null)
        }
        style={{
          display: "block",
          marginBottom: "10px",
        }}
      />
    </>
  );
}