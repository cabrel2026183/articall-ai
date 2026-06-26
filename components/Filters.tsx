"use client";

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
          <option value="Issa">Issa</option>
          <option value="Idriss">Idriss</option>
          <option value="Dupont">Dupont</option>
        </select>
      </div>
    </>
  );
}