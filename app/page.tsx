"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [search, setSearch] = useState("");
  const [filtreUrgence, setFiltreUrgence] = useState("tous");
  const [filtreTechnicien, setFiltreTechnicien] = useState("tous");
  const [user, setUser] = useState<any>(null);
   const ADMIN_EMAIL = "engomecabrel@gmail.com";


const isAdmin =
  user?.email?.toLowerCase().trim() === ADMIN_EMAIL;
  const [loading, setLoading] = useState(true);
  const [interventionDate, setInterventionDate] = useState("");
 const [amount, setAmount] = useState("");
 const [paymentStatus, setPaymentStatus] = useState("non_paye");
 const [technician, setTechnician] = useState("");
 const [selectedCall, setSelectedCall] = useState<any>(null);
 const [editingId, setEditingId] = useState<string | null>(null);
  async function chargerAppels() {
    const {
  data: { user },
} = await supabase.auth.getUser();

let query = supabase
  .from("calls")
  .select("*")
  .order("created_at", { ascending: false });

if (user?.email !== "engomecabrel@gmail.com") {
  query = query.eq("user_id", user?.id);
}

const { data, error } = await query;
    if (error) {
      alert(error.message);
    } else {
      setCalls(data || []);
    }
  }

  async function ajouterAppel() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appelData = {
    user_id: user?.id,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail,
    problem,
    urgency,
    intervention_date: interventionDate || null,
    amount: amount ? Number(amount) : null,
    payment_status: paymentStatus,
    technician: technician,
    summary: problem,
    status: "nouveau",
  };

  let error;

  if (editingId) {
    const result = await supabase
      .from("calls")
      .update(appelData)
      .eq("id", editingId);

    error = result.error;
  } else {
    const result = await supabase
      .from("calls")
      .insert(appelData);

    error = result.error;
  }

  if (error) {
    alert(error.message);
  } else {
    setClientName("");
    setClientPhone("");
    setProblem("");
    setUrgency("normal");
    setAmount("");
    setPaymentStatus("non_paye");
    setInterventionDate("");
    setEditingId(null);
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


async function enregistrerNumeroFacture(
  id: string,
  invoiceNumber: string
) {
  const { error } = await supabase
    .from("calls")
    .update({
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
  }
}

async function marquerPaye(id: string) {
  const { error } = await supabase
    .from("calls")
    .update({ payment_status: "paye" })
    .eq("id", id);

  if (error) {
    alert(error.message);
  } else {
    chargerAppels();
  }
}

function genererBonIntervention(call: any) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("ARTICALL AI", 20, 20);

  doc.setFontSize(14);
  doc.text("BON D'INTERVENTION", 20, 32);

  autoTable(doc, {
    startY: 45,
    head: [["Information", "Détail"]],
    body: [
      ["Client", call.client_name || ""],
      ["Téléphone", call.client_phone || ""],
      ["Problème", call.problem || ""],
      [
        "Date intervention",
        call.intervention_date
          ? new Date(call.intervention_date).toLocaleString("fr-FR")
          : "",
      ],
      ["Montant", `${call.amount || 0} €`],
     [
  "Paiement",
  call.payment_status === "paye"
    ? "Payé"
    : "Non payé",
],
      [
  "Statut",
  call.status === "nouveau"
    ? "Nouveau"
    : call.status === "rappelé"
    ? "Rappelé"
    : "Terminé",
],
    ],
  });

  doc.setFontSize(10);
  doc.text(
    "Document généré par ArtiCall AI - Non valable comme facture officielle",
    20,
    280
  );

  doc.save(`bon-intervention-${call.client_name || "client"}.pdf`);
}
function genererFacture(call: any) {
  const doc = new jsPDF();

  const numeroFacture =
  call.invoice_number ||
  `FAC-${new Date().getFullYear()}-${call.id.slice(0, 6)}`;

if (!call.invoice_number) {
  enregistrerNumeroFacture(call.id, numeroFacture);
}

  doc.setFontSize(20);
  doc.text("ARTICALL AI", 20, 20);

  doc.setFontSize(16);
  doc.text("FACTURE", 20, 35);

  autoTable(doc, {
    startY: 50,
    head: [["Information", "Valeur"]],
    body: [
      ["Facture", numeroFacture],
      ["Client", call.client_name || ""],
      ["Téléphone", call.client_phone || ""],
      ["Email", call.client_email || ""],
      ["Prestation", call.problem || ""],
      [
        "Date",
        call.intervention_date
          ? new Date(call.intervention_date).toLocaleDateString("fr-FR")
          : "",
      ],
      ["Montant TTC", `${call.amount || 0} €`],
      [
        "Paiement",
        call.payment_status === "paye"
          ? "Payé"
          : "Non payé",
      ],
    ],
  });

  doc.save(`facture-${numeroFacture}.pdf`);
}
async function envoyerEmail(call: any) {
  try {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("ARTICALL AI", 20, 20);

    doc.setFontSize(14);
    doc.text("BON D'INTERVENTION", 20, 32);

    autoTable(doc, {
      startY: 45,
      head: [["Information", "Détail"]],
      body: [
        ["Client", call.client_name || ""],
        ["Téléphone", call.client_phone || ""],
        ["Email", call.client_email || ""],
        ["Problème", call.problem || ""],
        [
          "Date intervention",
          call.intervention_date
            ? new Date(call.intervention_date).toLocaleString("fr-FR")
            : "",
        ],
        ["Montant", `${call.amount || 0} €`],
        ["Paiement", call.payment_status === "paye" ? "Payé" : "Non payé"],
        ["Technicien", call.technician || ""],
      ],
    });

    const pdfBase64 = doc.output("datauristring").split(",")[1];

    const response = await fetch("/api/send-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: call.client_email,
        clientName: call.client_name,
        pdfBase64,
      }),
    });

    if (response.ok) {
      alert("Email avec PDF envoyé avec succès !");
    } else {
      const result = await response.json();
      alert("Erreur : " + JSON.stringify(result));
    }
  } catch (error) {
    alert("Erreur lors de l'envoi.");
  }
}
async function envoyerFacture(call: any) {
  try {
    const doc = new jsPDF();

    const numeroFacture =
      call.invoice_number ||
      `FAC-${new Date().getFullYear()}-${call.id.slice(0, 6)}`;

    doc.setFontSize(20);
    doc.text("ARTICALL AI", 20, 20);

    doc.setFontSize(16);
    doc.text("FACTURE", 20, 35);

    autoTable(doc, {
      startY: 50,
      head: [["Information", "Valeur"]],
      body: [
        ["Facture", numeroFacture],
        ["Client", call.client_name || ""],
        ["Téléphone", call.client_phone || ""],
        ["Email", call.client_email || ""],
        ["Prestation", call.problem || ""],
        [
          "Date",
          call.intervention_date
            ? new Date(call.intervention_date).toLocaleDateString("fr-FR")
            : "",
        ],
        ["Montant TTC", `${call.amount || 0} €`],
        ["Paiement", call.payment_status === "paye" ? "Payé" : "Non payé"],
      ],
    });

    const pdfBase64 = doc.output("datauristring").split(",")[1];

    const response = await fetch("/api/send-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: call.client_email,
        clientName: call.client_name,
        pdfBase64,
        filename: `facture-${numeroFacture}.pdf`,
        subject: `Votre facture ${numeroFacture}`,
      }),
    });

    if (response.ok) {
      alert("Facture envoyée avec succès !");
    } else {
      const result = await response.json();
      alert("Erreur : " + JSON.stringify(result));
    }
  } catch (error) {
    alert("Erreur lors de l'envoi de la facture.");
  }
}
  async function supprimerAppel(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cet appel ?")) return;

    const { error } = await supabase.from("calls").delete().eq("id", id);

    if (error) alert(error.message);
    else chargerAppels();
  }
  function modifierAppel(call: any) {
  setEditingId(call.id);
  setClientName(call.client_name || "");
  setClientPhone(call.client_phone || "");
  setClientEmail(call.client_email || "");
  setProblem(call.problem || "");
  setUrgency(call.urgency || "normal");

  setInterventionDate(
    call.intervention_date
      ? new Date(call.intervention_date).toISOString().slice(0, 16)
      : ""
  );

  setAmount(
    call.amount !== null && call.amount !== undefined
      ? String(call.amount)
      : ""
  );

  setPaymentStatus(call.payment_status || "non_paye");

  window.scrollTo({ top: 0, behavior: "smooth" });
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
<button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }}
>
  Déconnexion
</button>
<p>
  Connecté : {user?.email}
</p>
{isAdmin ? (
  <p style={{ color: "red", fontWeight: "bold" }}>
    👑 Administrateur
  </p>
) : (
  <p>Compte utilisateur</p>
)}

      <p>Ne perdez plus aucun client à cause d'un appel manqué.</p>

      <div style={{ border: "1px solid #ddd", padding: "15px", marginBottom: "20px" }}>
        <h3>Nouvel appel</h3>

        <input type="text" placeholder="Nom du client" value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />

        <input type="text" placeholder="Téléphone" value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />

          <input
  type="email"
  placeholder="Email du client"
  value={clientEmail}
  onChange={(e) => setClientEmail(e.target.value)}
  style={{
    display: "block",
    marginBottom: "10px",
    width: "300px",
  }}
/>

        <textarea placeholder="Décrivez le problème" value={problem}
          onChange={(e) => setProblem(e.target.value)}
          style={{ display: "block", marginBottom: "10px", width: "300px" }} />
<input
  type="datetime-local"
  value={interventionDate}
  onChange={(e) => setInterventionDate(e.target.value)}
  style={{ display: "block", marginBottom: "10px", width: "300px" }}
/>

<input
  type="number"
  placeholder="Montant (€)"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  style={{
    display: "block",
    marginBottom: "10px",
    width: "300px",
  }}
/>
<select
  value={paymentStatus}
  onChange={(e) => setPaymentStatus(e.target.value)}
  style={{
    display: "block",
    marginBottom: "10px",
  }}
>
  <option value="non_paye">💸 Non payé</option>
  <option value="paye">✅ Payé</option>
</select>

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

        <select value={urgency} onChange={(e) => setUrgency(e.target.value)}
          style={{ display: "block", marginBottom: "10px" }}>
          <option value="normal">Normal</option>
          <option value="important">Important</option>
          <option value="urgent">Urgent</option>
        </select>

        <button onClick={ajouterAppel}>
  {editingId ? "Modifier l'appel" : "Enregistrer l'appel"}
</button>
      </div>

      <div
  style={{
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "20px",
  }}
>
  <h3>Tableau de bord</h3>
<p>
  💰 Chiffre d'affaires total :{" "}
  {calls.reduce(
    (total, call) => total + (call.amount || 0),
    0
)} €

</p>

<p>
  💰 CA encaissé :{" "}
  {calls
    .filter((call) => call.payment_status === "paye")
    .reduce((total, call) => total + (call.amount || 0), 0)}
  {" "}€
</p>
<p>
  ⏳ Reste à encaisser :{" "}
  {calls
    .filter((call) => call.payment_status !== "paye")
    .reduce((total, call) => total + (call.amount || 0), 0)}
  {" "}€
</p>
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
<h2>📅 Calendrier des interventions</h2>

<FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  locale={frLocale}
  height="auto"
  eventDisplay="block"
 events={calls
  .filter((call) => call.intervention_date)
  .map((call) => ({
    title: `${call.client_name}`,
    date: call.intervention_date,
    color:
      call.urgency === "urgent"
        ? "red"
        : call.urgency === "important"
        ? "orange"
        : "green",
    extendedProps: {
      call,
    },
  }))}
eventClick={(info) => {
  setSelectedCall(info.event.extendedProps.call);
}}

/>
{selectedCall && (
  <div
    style={{
      border: "2px solid #333",
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "10px",
      backgroundColor: "#f5f5f5",
    }}
  >
    <h3>{selectedCall.client_name}</h3>

    <p>📞 {selectedCall.client_phone}</p>

    <p>🛠️ {selectedCall.problem}</p>

    {selectedCall.technician && (
  <p>
    👷 {selectedCall.technician}
  </p>
)}

{selectedCall.amount !== null &&
 selectedCall.amount !== undefined && (
  <p>
    💰 {selectedCall.amount} €
  </p>
)}

<div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button onClick={() => modifierAppel(selectedCall)}>
    ✏️ Modifier
  </button>

 <button onClick={() => genererBonIntervention(selectedCall)}>
  📄 Générer PDF
</button>


<button onClick={() => envoyerEmail(selectedCall)}>
  📧 Email
</button>

  {selectedCall.payment_status !== "paye" && (
    <button onClick={() => marquerPaye(selectedCall.id)}>
      ✅ Marquer payé
    </button>
  )}

  <button onClick={() => setSelectedCall(null)}>
    Fermer
  </button>
</div>

  </div>
)}
<h2>🚨 Interventions du jour</h2>

{calls
  .filter((call) => {
    if (!call.intervention_date) return false;

    const today = new Date();
    const intervention = new Date(call.intervention_date);

    return (
      intervention.getDate() === today.getDate() &&
      intervention.getMonth() === today.getMonth() &&
      intervention.getFullYear() === today.getFullYear()
    );
  })
  .map((call) => (
    <div key={`today-${call.id}`}>
      <p>
        🛠️ {call.client_name} -{" "}
        {new Date(call.intervention_date).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  ))}
 <h2>⚠️ Interventions en retard</h2>
<p>
  Une intervention est en retard si l'heure prévue est passée et que le statut n'est pas terminé.
</p>

{calls
  .filter((call) => {
    if (!call.intervention_date) return false;

    const intervention = new Date(call.intervention_date);
    const today = new Date();

    const estAujourdHui =
      intervention.getDate() === today.getDate() &&
      intervention.getMonth() === today.getMonth() &&
      intervention.getFullYear() === today.getFullYear();

    return (
      !estAujourdHui &&
      intervention < today &&
      call.status !== "termine"
    );
  })
  .map((call) => (
    <div key={`late-${call.id}`}>
      <p>
        🛠️ {call.client_name} -{" "}
        {new Date(call.intervention_date).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </p>
    </div>
  ))}
<h2>📅 Interventions à venir</h2>
{calls
  .filter((call) => {
  if (!call.intervention_date) return false;

  const intervention = new Date(call.intervention_date);
  const now = new Date();

  const estAujourdHui =
    intervention.getDate() === now.getDate() &&
    intervention.getMonth() === now.getMonth() &&
    intervention.getFullYear() === now.getFullYear();

  return (
    !estAujourdHui &&
    intervention > now &&
    call.status !== "termine"
  );
})
  .sort(
    (a, b) =>
      new Date(a.intervention_date).getTime() -
      new Date(b.intervention_date).getTime()
  )
  .map((call) => (
    <div key={call.id}>
      <p>
        🛠️ {call.client_name} -
        {" "}
        {new Date(call.intervention_date).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </p>
    </div>
  ))}
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
        call.urgency === filtreUrgence) &&

      (filtreTechnicien === "tous" ||
        call.technician === filtreTechnicien)
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

            <button onClick={() => modifierAppel(call)}>
            Modifier
            </button>

            <button onClick={() => genererBonIntervention(call)}>
           📄 Générer PDF
           </button>

           
           <button onClick={() => genererFacture(call)}>
           🧾 Générer Facture
           </button>

           <button onClick={() => envoyerFacture(call)}>
           📧 Envoyer Facture
           </button>

            {call.payment_status !== "paye" && (
           <button onClick={() => marquerPaye(call.id)}>
           ✅ Marquer payé
           </button>
            )}
            <button onClick={() => supprimerAppel(call.id)}>Supprimer</button>
          </div>

         <strong>{call.client_name}</strong>

<p>{call.client_phone}</p>

<a href={`tel:${call.client_phone}`}>
  <button>📞 Appeler</button>
</a>

<p>📅 {afficherDate(call.created_at)}</p>
{call.intervention_date && (
  <p>
    🛠️ Intervention :
    {" "}
    {new Date(call.intervention_date).toLocaleString("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
})}
  </p>
)}

{call.amount !== null && call.amount !== undefined && (
  <p>
    💰 Montant : {call.amount} €
  </p>
)}
<p>
  Paiement :
  {call.payment_status === "paye"
    ? " ✅ Payé"
    : " 💸 Non payé"}
</p>

{call.technician && (
  <p>
    👷 Technicien : {call.technician}
  </p>
)}

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