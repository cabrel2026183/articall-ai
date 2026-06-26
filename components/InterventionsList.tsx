"use client";

type InterventionsListProps = {
  calls: any[];
  search: string;
  filtreUrgence: string;
  filtreTechnicien: string;
  role: string;
  afficherDate: (date: string) => string;
  marquerRappele: (id: string) => void;
  marquerTermine: (id: string) => void;
  modifierAppel: (call: any) => void;
  genererBonIntervention: (call: any) => void;
  genererFacture: (call: any) => void;
  envoyerFacture: (call: any) => void;
  marquerPaye: (id: string) => void;
  supprimerAppel: (id: string) => void;
};

export default function InterventionsList({
  calls,
  search,
  filtreUrgence,
  filtreTechnicien,
  role,
  afficherDate,
  marquerRappele,
  marquerTermine,
  modifierAppel,
  genererBonIntervention,
  genererFacture,
  envoyerFacture,
  marquerPaye,
  supprimerAppel,
}: InterventionsListProps) {
  return (
    <>
      <h2>Appels reçus</h2>
      <p>🟡 Nouveau → 🟢 Rappelé → 🔵 Terminé</p>

      {calls
        .filter(
          (call) =>
            (call.client_name
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
              call.client_phone?.includes(search)) &&
            (filtreUrgence === "tous" || call.urgency === filtreUrgence) &&
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

              <button onClick={() => modifierAppel(call)}>Modifier</button>

              <button onClick={() => genererBonIntervention(call)}>
                📄 Générer PDF
              </button>

              {role === "admin" && (
                <>
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

                  <button onClick={() => supprimerAppel(call.id)}>
                    Supprimer
                  </button>
                </>
              )}
            </div>

            <strong>{call.client_name}</strong>

            <p>{call.client_phone}</p>

            <a href={`tel:${call.client_phone}`}>
              <button>📞 Appeler</button>
            </a>

            <p>📅 {afficherDate(call.created_at)}</p>

            {call.intervention_date && (
              <p>
                🛠️ Intervention :{" "}
                {new Date(call.intervention_date).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            )}

            {call.amount !== null && call.amount !== undefined && (
              <p>💰 Montant : {call.amount} €</p>
            )}

            <p>
              Paiement :
              {call.payment_status === "paye" ? " ✅ Payé" : " 💸 Non payé"}
            </p>

            {call.technician && <p>👷 Technicien : {call.technician}</p>}

            <p>{call.problem}</p>

            {call.photo_url && (
              <img
                src={call.photo_url}
                alt="Photo intervention"
                style={{
                  maxWidth: "300px",
                  marginTop: "10px",
                  borderRadius: "8px",
                }}
              />
            )}

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
    </>
  );
}