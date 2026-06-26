"use client";

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
        <option value="Issa">Issa</option>
        <option value="Idriss">Idriss</option>
        <option value="Dupont">Dupont</option>
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