"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");

  async function chargerAppels() {
    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
    } else {
      setCalls(data || []);
    }
  }

  async function ajouterAppel() {
    const { error } = await supabase.from("calls").insert({
      client_name: clientName,
      client_phone: clientPhone,
      problem,
      urgency,
      summary: problem,
      status: "nouveau",
    });

    if (error) {
      alert(error.message);
    } else {
      setClientName("");
      setClientPhone("");
      setProblem("");
      setUrgency("normal");
      chargerAppels();
    }
  }

  async function marquerRappele(id: string) {
    const { error } = await supabase
      .from("calls")
      .update({ status: "rappelé" })
      .eq("id", id);

    if (error) alert(error.message);
    else chargerAppels();
  }

  async function marquerTermine(id: string) {
    const { error } = await supabase
      .from("calls")
      .update({ status: "termine" })
      .eq("id", id);

    if (error) alert(error.message);
    else chargerAppels();
  }

  async function supprimerAppel(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cet appel ?")) return;

    const { error } = await supabase.from("calls").delete().eq("id", id);

    if (error) alert(error.message);
    else chargerAppels();
  }

  useEffect(() => {
    chargerAppels();
  }, []);

  return (
    <main style={{ padding: "40px" }}>
      <h1>ArtiCall AI</h1>

      <p>Ne perdez plus aucun client à cause d'un appel manqué.</p>

      <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px" }}>
        <h3>Nouvel appel</h3>

        <input type="text" placeholder="Nom du client" value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />

        <input type="text" placeholder="Téléphone" value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />

        <textarea placeholder="Décrivez le problème" value={problem}
          onChange={(e) => setProblem(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />

        <select value={urgency} onChange={(e) => setUrgency(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}>
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </select>

        <button onClick={ajouterAppel}>Enregistrer l'appel</button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px" }}>
        <h3>Tableau de bord</h3>
        <p>Total appels : {calls.length}</p>
        <p>Nouveaux : {calls.filter((c) => c.status === "nouveau").length}</p>
        <p>Rappelés : {calls.filter((c) => c.status === "rappelé").length}</p>
        <p>Terminés : {calls.filter((c) => c.status === "termine").length}</p>
      </div>

      <h2>Appels reçus</h2>
      <p>🟡 Nouveau → 🟢 Rappelé → 🔵 Terminé</p>

      {calls.map((call) => (
        <div
          key={call.id}
          style={{
            border: call.urgency === "urgent" ? "2px solid red" : "1px solid #ddd",
            backgroundColor: call.urgency === "urgent" ? "#fff5f5" : "white",
            padding: "10px",
            marginTop: "10px",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            {call.status === "nouveau" && (
              <button onClick={() => marquerRappele(call.id)}>Rappelé</button>
            )}

            {call.status === "rappelé" && (
              <button onClick={() => marquerTermine(call.id)}>Terminé</button>
            )}

            <button onClick={() => supprimerAppel(call.id)}>Supprimer</button>
          </div>

          <strong>{call.client_name}</strong>
          <p>{call.client_phone}</p>
          <p>{call.problem}</p>

          <p>
            Urgence :
            {call.urgency === "normal" && " 🟢 Normal"}
            {call.urgency === "important" && " 🟠 Important"}
            {call.urgency === "urgent" && " 🔴 Urgent"}
          </p>

          <p>
            Statut :
            {call.status === "nouveau" && " 🟡 Nouveau"}
            {call.status === "rappelé" && " 🟢 Rappelé"}
            {call.status === "termine" && " 🔵 Terminé"}
          </p>
        </div>
      ))}
    </main>
  );
}