"use client";

type Props = {
  call: any;
  role: string;
  afficherDate: (date: string) => string;
  modifierAppel: (call: any) => void;
  genererBonIntervention: (call: any) => void;
  genererFacture: (call: any) => void;
  envoyerFacture: (call: any) => void;
  envoyerEmail: (call: any) => void;
  marquerPaye: (id: string) => void;
  supprimerAppel: (id: string) => void;
  marquerRappele: (id: string) => void;
  marquerTermine: (id: string) => void;
  setSelectedCall: (call: any) => void;
};

export default function InterventionDetails({
  call,
  role,
  afficherDate,
  modifierAppel,
  genererBonIntervention,
  genererFacture,
  envoyerFacture,
  envoyerEmail,
  marquerPaye,
  supprimerAppel,
  marquerRappele,
  marquerTermine,
  setSelectedCall,
}: Props) {
  if (!call) {
    return (
      <div style={{ border: "1px solid #ddd", padding: "15px", marginTop: "20px" }}>
        <h2>Fiche intervention</h2>
        <p>Clique sur une intervention dans le tableau pour voir les détails.</p>
      </div>
    );
  }

  return (
    <div style={{ border: "2px solid #333", padding: "15px", marginTop: "20px", borderRadius: "10px" }}>
      <h2>👤 {call.client_name}</h2>

      <p>📞 {call.client_phone}</p>
      {call.client_email && <p>📧 {call.client_email}</p>}
      {call.address && <p>📍 {call.address}</p>}
      {call.technician && call.technician !== "vide" && <p>👷 {call.technician}</p>}
      <p>📅 {afficherDate(call.created_at)}</p>

      {call.intervention_date && (
        <p>🛠️ Intervention : {new Date(call.intervention_date).toLocaleString("fr-FR")}</p>
      )}

      <p>💰 {call.amount || 0} €</p>
      <p>{call.payment_status === "paye" ? "✅ Payé" : "💸 Non payé"}</p>
      <p>🚨 {call.urgency}</p>
      <p>📋 {call.status}</p>

      <hr />

      <p>{call.problem}</p>

      {call.address && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(call.address)}`}
          target="_blank"
        >
          <button>🗺️ Ouvrir dans Google Maps</button>
        </a>
      )}

      {call.photo_url && (
        <div>
          <p>📸 Photo intervention</p>
          <img
            src={call.photo_url}
            alt="Photo intervention"
            style={{ maxWidth: "300px", borderRadius: "8px" }}
          />
        </div>
      )}

      {call.signature_url && <p>✍️ Signature enregistrée</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "15px" }}>
        {call.status === "nouveau" && (
          <button onClick={() => marquerRappele(call.id)}>Rappelé</button>
        )}

        {call.status === "rappelé" && (
          <button onClick={() => marquerTermine(call.id)}>Terminé</button>
        )}

        <button onClick={() => modifierAppel(call)}>✏️ Modifier</button>
        <button onClick={() => genererBonIntervention(call)}>📄 Bon PDF</button>
        <button onClick={() => envoyerEmail(call)}>📧 Email</button>

        {role === "admin" && (
          <>
            <button onClick={() => genererFacture(call)}>🧾 Facture</button>
            <button onClick={() => envoyerFacture(call)}>📧 Envoyer facture</button>

            {call.payment_status !== "paye" && (
              <button onClick={() => marquerPaye(call.id)}>✅ Marquer payé</button>
            )}

            <button onClick={() => supprimerAppel(call.id)}>Supprimer</button>
          </>
        )}

        <button onClick={() => setSelectedCall(null)}>Fermer</button>
      </div>
    </div>
  );
}