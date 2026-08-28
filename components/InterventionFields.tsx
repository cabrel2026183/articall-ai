"use client";

type InterventionFieldsProps = {
  problem: string;
  setProblem: (value: string) => void;
  interventionDate: string;
  setInterventionDate: (value: string) => void;
  urgency: string;
  setUrgency: (value: string) => void;
};

export default function InterventionFields({
  problem,
  setProblem,
  interventionDate,
  setInterventionDate,
  urgency,
  setUrgency,
}: InterventionFieldsProps) {
  return (
    <>
      <textarea
        placeholder="Décrivez le problème"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
          width: "300px",
        }}
      />

      
      <select
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
        }}
      >
        <option value="normal">Normal</option>
        <option value="important">Important</option>
        <option value="urgent">Urgent</option>
      </select>
    </>
  );
}