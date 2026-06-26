"use client";

import Dashboard from "../components/Dashboard";
import CallForm from "../components/CallForm";
import InterventionsList from "../components/InterventionsList";
import CalendarView from "../components/CalendarView";
import Filters from "../components/Filters";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  const [calls, setCalls] = useState<any[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [address, setAddress] = useState("");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [search, setSearch] = useState("");
  const [filtreUrgence, setFiltreUrgence] = useState("tous");
  const [filtreTechnicien, setFiltreTechnicien] = useState("tous");
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
 const [photo, setPhoto] = useState<File | null>(null);
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
  async function chargerAppels(
  roleActuel?: string,
  technicienActuel?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("calls")
    .select("*")
    .order("created_at", { ascending: false });

  const email = user?.email?.toLowerCase().trim();
  const roleFinal =
    email === "engomecabrel@gmail.com"
      ? "admin"
      : roleActuel || role;

 if (roleFinal !== "admin") {
  const nomTechnicien =
    email === "idriss@articallai.com"
      ? "Idriss"
      : technicienActuel;

  query = query.eq("technician", nomTechnicien);
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

let photoUrl = null;

if (photo) {
  const fileName =
    Date.now() + "-" + photo.name;

  const { error: uploadError } =
    await supabase.storage
      .from("intervention-photos")
      .upload(fileName, photo);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const { data } = supabase.storage
    .from("intervention-photos")
    .getPublicUrl(fileName);

  photoUrl = data.publicUrl;
}
  const appelData = {
    user_id: user?.id,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail,
    address,
    problem,
    urgency,
    photo_url: photoUrl,
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
  setClientEmail("");
  setAddress("");
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
  setAddress(call.address || "");
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
    const { data: profile } = await supabase
  .from("profiles")
  .select("role, technician_name")
  .eq("email", user.email?.toLowerCase().trim())
  .single();

console.log("PROFILE =", profile);

setRole(
  user.email?.toLowerCase().trim() === "engomecabrel@gmail.com"
    ? "admin"
    : profile?.role || "technicien"
);
    setLoading(false);
   chargerAppels(
  user.email?.toLowerCase().trim() === "engomecabrel@gmail.com"
    ? "admin"
    : profile?.role || "technicien",
  profile?.technician_name
);
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
      <Header
  user={user}
  role={role}
/>

     {role === "admin" && (
  <CallForm
    editingId={editingId}
    clientName={clientName}
    setClientName={setClientName}
    clientPhone={clientPhone}
    setClientPhone={setClientPhone}
    clientEmail={clientEmail}
    setClientEmail={setClientEmail}
    address={address}
    setAddress={setAddress}
    problem={problem}
    setProblem={setProblem}
    interventionDate={interventionDate}
    setInterventionDate={setInterventionDate}
    urgency={urgency}
    setUrgency={setUrgency}
    amount={amount}
    setAmount={setAmount}
    paymentStatus={paymentStatus}
    setPaymentStatus={setPaymentStatus}
    technician={technician}
    setTechnician={setTechnician}
    setPhoto={setPhoto}
    ajouterAppel={ajouterAppel}
  />
)}

      <Dashboard calls={calls} />

    <Filters
  search={search}
  setSearch={setSearch}
  filtreUrgence={filtreUrgence}
  setFiltreUrgence={setFiltreUrgence}
  filtreTechnicien={filtreTechnicien}
  setFiltreTechnicien={setFiltreTechnicien}
/> 

<CalendarView
  calls={calls}
  setSelectedCall={setSelectedCall}
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

     <InterventionsList
  calls={calls}
  search={search}
  filtreUrgence={filtreUrgence}
  filtreTechnicien={filtreTechnicien}
  role={role}
  afficherDate={afficherDate}
  marquerRappele={marquerRappele}
  marquerTermine={marquerTermine}
  modifierAppel={modifierAppel}
  genererBonIntervention={genererBonIntervention}
  genererFacture={genererFacture}
  envoyerFacture={envoyerFacture}
  marquerPaye={marquerPaye}
  supprimerAppel={supprimerAppel}
/> 

</main>
);
}