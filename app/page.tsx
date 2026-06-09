"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [search, setSearch] = useState("");
  const [filtreUrgence, setFiltreUrgence] = useState("tous");
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);

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
  async function verifierConnexion() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setUser(user);
    setLoading(false);
    chargerAppels();
  }

  verifierConnexion();
}, []);
if (loading) {
 return <main style={{ padding: "40px" }}>Chargement...</main>;
}
function afficherDate(date: string) {
  return new Date(date).toLocaleString("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
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

      <div
  style={{
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "20px",
  }}
>
  <h3>Tableau de bord</h3>

  <p>Nombre total d'appels : {calls.length}</p>

  <p>🔴 Urgents : {calls.filter((call) => call.urgency === "urgent").length}</p>

  <p>🟠 Importants : {calls.filter((call) => call.urgency === "important").length}</p>

  <p>🟢 Normaux : {calls.filter((call) => call.urgency === "normal").length}</p>

  <p>Nouveaux : {calls.filter((call) => call.status === "nouveau").length}</p>

  <p>Rappelés : {calls.filter((call) => call.status === "rappelé").length}</p>

  <p>Terminés : {calls.filter((call) => call.status === "termine").length}</p>
</div>
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
  <button onClick={() => setFiltreUrgence("tous")}>
    Tous
  </button>

  <button onClick={() => setFiltreUrgence("urgent")}>
    🔴 Urgents
  </button>

  <button onClick={() => setFiltreUrgence("important")}>
    🟠 Importants
  </button>

  <button onClick={() => setFiltreUrgence("normal")}>
    🟢 Normaux
  </button>
</div>
</div>
      <h2>Appels reçus</h2>
      <p>🟡 Nouveau → 🟢 Rappelé → 🔵 Terminé</p>

      {calls
  .filter(
    (call) =>
      (call.client_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
        call.client_phone?.includes(search)) &&
      (filtreUrgence === "tous" ||
        call.urgency === filtreUrgence)
  )
  .map((call) => (
        <div
          key={call.id}
         style={{
  border:
    call.urgency === "urgent"
      ? "2px solid red"
      : call.urgency === "important"
      ? "2px solid orange"
      : "2px solid green",

  backgroundColor:
    call.urgency === "urgent"
      ? "#ffe5e5"
      : call.urgency === "important"
      ? "#fff4e5"
      : "#eaffea",

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

<a href={`tel:${call.client_phone}`}>
  <button>📞 Appeler</button>
</a>

<p>📅 {afficherDate(call.created_at)}</p>

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