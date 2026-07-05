"use client";

import Dashboard from "../components/Dashboard";
import InterventionsTable from "../components/InterventionsTable";
import CallForm from "../components/CallForm";
import MainLayout from "../components/MainLayout";
import InterventionsList from "../components/InterventionsList";
import CalendarView from "../components/CalendarView";
import Filters from "../components/Filters";
import InterventionDetails from "../components/InterventionDetails";
import SignaturePad from "../components/SignaturePad";
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
 const [signature, setSignature] = useState("");
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

async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

async function genererBonIntervention(call: any) {
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
let positionY = (doc as any).lastAutoTable?.finalY || 180;

if (call.photo_url) {
  const photoBase64 = await imageUrlToBase64(call.photo_url);

  doc.setFontSize(12);
  doc.text("Photo de l'intervention :", 20, positionY + 15);

  doc.addImage(photoBase64, "JPEG", 20, positionY + 20, 80, 60);

  positionY = positionY + 90;
}

if (call.signature_url) {
  doc.setFontSize(12);
  doc.text("Signature du client :", 20, positionY + 15);

  doc.addImage(
    call.signature_url,
    "PNG",
    20,
    positionY + 20,
    60,
    30
  );
}

console.log(call.photo_url);

alert("PHOTO URL = " + call.photo_url);

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

    if (call.signature_url) {
  const finalY = (doc as any).lastAutoTable?.finalY || 180;

  doc.setFontSize(12);
  doc.text("Signature du client :", 20, finalY + 15);

  doc.addImage(
    call.signature_url,
    "PNG",
    20,
    finalY + 20,
    60,
    30
  );
}

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
    <MainLayout
  user={user}
  role={role}
>
     

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

<InterventionsTable
  calls={calls}
  afficherDate={afficherDate}
  setSelectedCall={setSelectedCall}
/>

<CalendarView
  calls={calls}
  setSelectedCall={setSelectedCall}
/>

     <InterventionDetails
  call={selectedCall}
  role={role}
  afficherDate={afficherDate}
  modifierAppel={modifierAppel}
  genererBonIntervention={genererBonIntervention}
  genererFacture={genererFacture}
  envoyerFacture={envoyerFacture}
  envoyerEmail={envoyerEmail}
  marquerPaye={marquerPaye}
  supprimerAppel={supprimerAppel}
  marquerRappele={marquerRappele}
  marquerTermine={marquerTermine}
  setSelectedCall={setSelectedCall}
/>

</MainLayout>
);
}