"use client";

import Dashboard from "../components/Dashboard";
import InterventionsTable from "../components/InterventionsTable";
import CallForm from "../components/CallForm";
import { useSearchParams } from "next/navigation";
import MainLayout from "../components/MainLayout";
import TechnicianDashboard from "../components/technician/TechnicianDashboard";
import CalendarView from "../components/CalendarView";
import Filters from "../components/Filters";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import type { Call, AuthUser } from "../lib/types";

function HomeContent() {
  const searchParams = useSearchParams();
const clientCallId = searchParams.get("callId");
  const [calls, setCalls] = useState<Call[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientReconnu, setClientReconnu] = useState<Pick<
    Call,
    | "id"
    | "client_name"
    | "client_phone"
    | "client_email"
    | "address"
    | "street_number"
    | "street_name"
    | "postal_code"
    | "city"
    | "country"
    | "property_type"
    | "property_type_other"
    | "created_at"
  > | null>(null);
const [rechercheClient, setRechercheClient] = useState(false);
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [address, setAddress] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
const [streetName, setStreetName] = useState("");
const [postalCode, setPostalCode] = useState("");
const [city, setCity] = useState("");
const [country, setCountry] = useState("France");
  const [problem, setProblem] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [requiredSkill, setRequiredSkill] = useState("");
const [recommendedMaterials, setRecommendedMaterials] = useState<string[]>([]);
const [workflowSummary, setWorkflowSummary] = useState("");
  const [search, setSearch] = useState("");
  const [filtreUrgence, setFiltreUrgence] = useState("tous");
  const [filtreTechnicien, setFiltreTechnicien] = useState("tous");
  const [technicianName, setTechnicianName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [propertyTypeOther, setPropertyTypeOther] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState("");
 const [photo, setPhoto] = useState<File | null>(null);
   
  const [loading, setLoading] = useState(true);
  const [interventionDate, setInterventionDate] = useState("");
 const [amount, setAmount] = useState("");
 const [paymentStatus, setPaymentStatus] = useState("non_paye");
 const [technician, setTechnician] = useState("");
  const [signature, setSignature] = useState("");
 const [editingId, setEditingId] = useState<string | null>(null);

   useEffect(() => {
    async function rechercherClientExistant() {
      const telephone = clientPhone
        .replace(/\s/g, "")
        .trim();

      if (telephone.length < 10) {
        setClientReconnu(null);
        return;
      }

      setRechercheClient(true);

      const { data, error } = await supabase
        .from("calls")
        .select(`
  id,
  client_name,
  client_phone,
  client_email,
  address,
  street_number,
  street_name,
  postal_code,
  city,
  country,
  property_type,
  property_type_other,
  created_at
`)
        .eq("client_phone", telephone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Erreur recherche client :",
          error
        );

        setRechercheClient(false);
        return;
      }

      if (!data) {
        setClientReconnu(null);
        setRechercheClient(false);
        return;
      }

     setClientReconnu(data);

setClientName(data.client_name || "");
setClientEmail(data.client_email || "");

setStreetNumber(data.street_number || "");
setStreetName(data.street_name || "");
setPostalCode(data.postal_code || "");
setCity(data.city || "");
setCountry(data.country || "France");

setAddress(data.address || "");
setPropertyType(data.property_type || "");
setPropertyTypeOther(data.property_type_other || "");

setRechercheClient(false);
    }

    const timer = setTimeout(() => {
      rechercherClientExistant();
    }, 400);

    return () => clearTimeout(timer);
  }, [clientPhone]);


 useEffect(() => {
  async function preRemplirClient() {
    if (!clientCallId) return;

    const { data, error } = await supabase
      .from("calls")
      .select(`
        client_name,
        client_phone,
        client_email,
        address
      `)
      .eq("id", clientCallId)
      .maybeSingle();

    if (error) {
      console.error("Erreur chargement client :", error);
      return;
    }

    if (!data) return;

    setClientName(data.client_name || "");
    setClientPhone(data.client_phone || "");
    setClientEmail(data.client_email || "");
    setAddress(data.address || "");
  }

  preRemplirClient();
}, [clientCallId]);

 async function chargerAppels(
  roleActuel?: string,
  technicienActuel?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  let query = supabase
    .from("calls")
    .select("*")
    .order("created_at", {
      ascending: false,
    });
const roleFinal = roleActuel || role;

  if (roleFinal !== "admin") {
    const nomTechnicien =
      technicienActuel ||
      technicianName;

    if (!nomTechnicien) {
      setCalls([]);
      return;
    }

    query = query.eq(
      "technician",
      nomTechnicien
    );
  }

  const { data, error } =
    await query;

  if (error) {
    alert(error.message);
    return;
  }

  setCalls(data || []);
}

async function geocoderAdresseClient(adresse: string) {
  if (!adresse.trim()) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  try {
    const response = await fetch("/api/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: adresse.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Erreur géocodage client :",
        data.error
      );

      return {
        latitude: null,
        longitude: null,
      };
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error(
      "Erreur géocodage client :",
      error
    );

    return {
      latitude: null,
      longitude: null,
    };
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

const positionClient =
  await geocoderAdresseClient(address);

  const appelData = {
    user_id: user?.id,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail,
    property_type: propertyType || null,
    property_type_other:
  propertyType === "autre"
    ? propertyTypeOther.trim() || null
    : null,
    address,
    street_number: streetNumber || null,
street_name: streetName || null,
postal_code: postalCode || null,
city: city || null,
country: country || "France",
    problem,
    urgency,
    photo_url: photoUrl,
    intervention_date: interventionDate || null,
    amount: amount ? Number(amount) : null,
    payment_status: paymentStatus,
    technician: technician,
    summary: problem,
    status: "nouveau",
    client_latitude: positionClient.latitude,
    client_longitude: positionClient.longitude,
    required_skill:
  requiredSkill || null,
recommended_materials:
  recommendedMaterials,
workflow_summary:
  workflowSummary || null,
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
  setStreetNumber("");
setStreetName("");
setPostalCode("");
setCity("");
setCountry("France");
  setProblem("");
  setUrgency("normal");
  setAmount("");
  setPaymentStatus("non_paye");
  setInterventionDate("");
  setEditingId(null);
  chargerAppels();
  setPropertyType("");
  setPropertyTypeOther("");
}
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
const roleFinal = profile?.role || "technicien";

setRole(roleFinal);
setLoading(false);
chargerAppels(roleFinal, profile?.technician_name);
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

if (role === "technicien") {
  return (
    <MainLayout
      user={user}
      role={role}
      calls={calls}
    >
      <TechnicianDashboard
        calls={calls}
        technicianName={technicianName}
      />
    </MainLayout>
  );
}

  return (
    <MainLayout
  user={user}
  role={role}
  calls={calls}
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
    streetNumber={streetNumber}
setStreetNumber={setStreetNumber}

streetName={streetName}
setStreetName={setStreetName}

postalCode={postalCode}
setPostalCode={setPostalCode}

city={city}
setCity={setCity}

country={country}
setCountry={setCountry}
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
    requiredSkill={requiredSkill}
setRequiredSkill={setRequiredSkill}

recommendedMaterials={recommendedMaterials}
setRecommendedMaterials={setRecommendedMaterials}

workflowSummary={workflowSummary}
setWorkflowSummary={setWorkflowSummary}

clientReconnu={clientReconnu}
rechercheClient={rechercheClient}
propertyType={propertyType}
setPropertyType={setPropertyType}
propertyTypeOther={propertyTypeOther}
setPropertyTypeOther={setPropertyTypeOther}
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
/>

<CalendarView calls={calls} />

</MainLayout>
);
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            padding: "30px",
          }}
        >
          Chargement d’ArtiCall AI...
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}