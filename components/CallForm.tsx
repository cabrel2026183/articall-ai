"use client";

import ClientFields from "./ClientFields";
import InterventionFields from "./InterventionFields";
import DynamicCallWorkflow from "./call/DynamicCallWorkflow";
import AvailabilityPicker from "./intervention/AvailabilityPicker";
import TechnicianFields from "./TechnicianFields";
import type { Call } from "../lib/types";

type CallFormProps = {
  editingId: string | null;

  clientName: string;
  setClientName: (value: string) => void;

  clientPhone: string;
  setClientPhone: (value: string) => void;

  clientEmail: string;
  setClientEmail: (value: string) => void;
  streetNumber: string;
setStreetNumber: (value: string) => void;

streetName: string;
setStreetName: (value: string) => void;

postalCode: string;
setPostalCode: (value: string) => void;

city: string;
setCity: (value: string) => void;

country: string;
setCountry: (value: string) => void;

  problem: string;
  setProblem: (value: string) => void;

  interventionDate: string;
  setInterventionDate: (value: string) => void;

  urgency: string;
  setUrgency: (value: string) => void;

  technician: string;
  setTechnician: (value: string) => void;

  setPhoto: (file: File | null) => void;

  ajouterAppel: () => void;

  address: string;
  setAddress: (value: string) => void;

  requiredSkill: string;
  setRequiredSkill: (value: string) => void;

  recommendedMaterials: string[];
  setRecommendedMaterials: (value: string[]) => void;

  workflowSummary: string;
  setWorkflowSummary: (value: string) => void;
  propertyType: string;
setPropertyType: (value: string) => void;
propertyTypeOther: string;
setPropertyTypeOther: (value: string) => void;

  clientReconnu: Pick<
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
  > | null;
rechercheClient: boolean;
};

export default function CallForm(props: CallFormProps) {
  return (
    <div
      style={{
        maxWidth: "1180px",
        margin: "0 auto 30px",
      }}
    >
      {/* EN-TÊTE */}
      <div
        style={{
          padding: "24px 26px",
          marginBottom: "20px",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #0f172a, #1e40af)",
          color: "white",
          boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                opacity: 0.8,
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Centre d'appels
            </div>

            <h2
              style={{
                margin: "6px 0 0",
                fontSize: "28px",
              }}
            >
              📞 {props.editingId ? "Modifier l'appel" : "Nouvel appel"}
            </h2>
          </div>

          <div
            style={{
              padding: "9px 13px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.15)",
              fontWeight: 700,
              fontSize: "13px",
            }}
          >
            Assistant métier activé
          </div>
        </div>
      </div>

      {props.rechercheClient && (
  <div
    style={{
      marginBottom: "20px",
      padding: "14px 16px",
      borderRadius: "12px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#64748b",
    }}
  >
    🔎 Recherche du client...
  </div>
)}

{props.clientReconnu && (
  <div
    style={{
      marginBottom: "20px",
      padding: "18px",
      borderRadius: "14px",
      background: "#ecfdf5",
      border: "1px solid #bbf7d0",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <strong
          style={{
            display: "block",
            color: "#166534",
            fontSize: "16px",
            marginBottom: "6px",
          }}
        >
          👤 Client reconnu
        </strong>

        <div style={{ color: "#334155", fontWeight: 700 }}>
          {props.clientReconnu.client_name || "Client"}
        </div>

        <div style={{ color: "#64748b", marginTop: "4px" }}>
          {props.clientReconnu.client_phone || ""}
        </div>

        {props.clientReconnu.address && (
          <div style={{ color: "#64748b", marginTop: "4px" }}>
            📍 {props.clientReconnu.address}
          </div>
        )}
      </div>

      <a
        href={`/clients/${props.clientReconnu.id}`}
        style={{
          padding: "10px 14px",
          borderRadius: "9px",
          background: "#166534",
          color: "white",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Voir la fiche client
      </a>
    </div>
  </div>
)}

      {/* GRILLE PRINCIPALE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* CLIENT */}
        <SectionCard
          icon="👤"
          title="Informations client"
          subtitle="Identité, contact et adresse"
        >
          <ClientFields
  clientName={props.clientName}
  setClientName={props.setClientName}
  clientPhone={props.clientPhone}
  setClientPhone={props.setClientPhone}
  clientEmail={props.clientEmail}
  setClientEmail={props.setClientEmail}
  address={props.address}
  setAddress={props.setAddress}

  streetNumber={props.streetNumber}
  setStreetNumber={props.setStreetNumber}
  streetName={props.streetName}
  setStreetName={props.setStreetName}
  postalCode={props.postalCode}
  setPostalCode={props.setPostalCode}
  city={props.city}
  setCity={props.setCity}
  country={props.country}
  setCountry={props.setCountry}
/>

{(!props.clientReconnu || !props.propertyType) && (
  <div
    style={{
      marginTop: "16px",
      padding: "16px",
      borderRadius: "12px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
    }}
  >
    <strong
      style={{
        display: "block",
        marginBottom: "10px",
        color: "#0f172a",
      }}
    >
      🏠 Type de logement
    </strong>

    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      {[
        ["appartement", "🏢 Appartement"],
        ["maison", "🏠 Maison"],
        ["commerce", "🏪 Commerce"],
        ["autre", "Autre"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() =>
            props.setPropertyType(value)
          }
          style={{
            padding: "10px 14px",
            borderRadius: "9px",
            border:
              props.propertyType === value
                ? "2px solid #2563eb"
                : "1px solid #cbd5e1",
            background:
              props.propertyType === value
                ? "#eff6ff"
                : "white",
            color: "#334155",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
)}
{props.propertyType === "autre" && (
  <div style={{ marginTop: "12px" }}>
    <label
      style={{
        display: "block",
        marginBottom: "6px",
        fontWeight: 700,
        color: "#475569",
      }}
    >
      Précisez le type de lieu
    </label>

    <input
      type="text"
      value={props.propertyTypeOther}
      onChange={(e) =>
        props.setPropertyTypeOther(e.target.value)
      }
      placeholder="Ex : Entrepôt, École, Atelier, Cabinet..."
      style={{
        width: "100%",
        padding: "11px 12px",
        borderRadius: "9px",
        border: "1px solid #cbd5e1",
        outline: "none",
      }}
    />
  </div>
)}

        </SectionCard>

        {/* DEMANDE */}
        <SectionCard
          icon="🔧"
          title="Demande du client"
          subtitle="Problème et niveau d'urgence"
        ><div
  style={{
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    marginTop: "16px",
  }}
>
  <div
    style={{
      marginBottom: "14px",
    }}
  >
    <strong
      style={{
        display: "block",
        fontSize: "17px",
        color: "#0f172a",
        marginBottom: "4px",
      }}
    >
      🩺 Problème & diagnostic
    </strong>

    <span
      style={{
        color: "#64748b",
        fontSize: "13px",
      }}
    >
      Description du problème et pré-diagnostic guidé.
    </span>
  </div>

  <InterventionFields
    problem={props.problem}
    setProblem={props.setProblem}
    interventionDate={props.interventionDate}
    setInterventionDate={props.setInterventionDate}
    urgency={props.urgency}
    setUrgency={props.setUrgency}
  />
   {/* QUESTIONNAIRE MÉTIER */}
      <div style={{ marginTop: "20px" }}>
        <SectionCard
          icon="🤖"
          title="Diagnostic assisté"
          subtitle="Questions adaptées au métier et aux réponses du client"
        >
          <DynamicCallWorkflow
            trade="plomberie"
            propertyType={props.propertyType}
            problem={props.problem}
            onResultChange={(result) => {
              if (result.intervention) {
                props.setProblem(result.intervention);
              }

              if (result.urgency) {
                props.setUrgency(result.urgency);
              }

              props.setRequiredSkill(result.skill || "");

              props.setRecommendedMaterials(
                result.materials || []
              );

              props.setWorkflowSummary(
                result.summary || ""
              );
            }}
          />
        </SectionCard>
      </div>

</div>
        </SectionCard>
      </div>

     

      {/* PLANIFICATION + ESTIMATION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px",
          marginTop: "20px",
          alignItems: "start",
        }}
      >
        <SectionCard
          icon="📍"
          title="Attribution & planning"
          subtitle="Technicien disponible et meilleur créneau"
        >
          <AvailabilityPicker
            address={props.address}
            problem={props.problem}
            urgency={props.urgency}
            interventionDate={props.interventionDate}
            setInterventionDate={props.setInterventionDate}
            technician={props.technician}
            setTechnician={props.setTechnician}
          />
        </SectionCard>

        </div>

      {/* TECHNICIEN - TEMPORAIRE */}
      {props.editingId && (
  <div style={{ marginTop: "20px" }}>
    <SectionCard
      icon="👷"
      title="Réattribution du technicien"
      subtitle="Le responsable peut remplacer manuellement le technicien attribué."
    >
      <TechnicianFields
        technician={props.technician}
        setTechnician={props.setTechnician}
        setPhoto={props.setPhoto}
      />
    </SectionCard>
  </div>
)}

      {/* SYNTHÈSE */}
      {(props.requiredSkill ||
        props.recommendedMaterials.length > 0 ||
        props.workflowSummary) && (
        <div style={{ marginTop: "20px" }}>
          <SectionCard
            icon="🧠"
            title="Synthèse automatique"
            subtitle="Informations utiles pour l'intervention"
          >
            {props.requiredSkill && (
              <SummaryLine
                label="Compétence requise"
                value={props.requiredSkill}
              />
            )}

            {props.workflowSummary && (
              <SummaryLine
                label="Résumé"
                value={props.workflowSummary}
              />
            )}

            {props.recommendedMaterials.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    color: "#475569",
                  }}
                >
                  🧰 Matériel conseillé
                </strong>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {props.recommendedMaterials.map(
                    (material) => (
                      <span
                        key={material}
                        style={{
                          padding: "7px 10px",
                          borderRadius: "999px",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {material}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* BOUTON PRINCIPAL */}
      <div
        style={{
          marginTop: "24px",
          padding: "22px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "18px",
          display: "flex",
          justifyContent: "center",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        <button
          type="button"
          onClick={props.ajouterAppel}
          style={{
            minWidth: "320px",
            padding: "16px 28px",
            borderRadius: "12px",
            border: "none",
            background: props.editingId
              ? "#f59e0b"
              : "#16a34a",
            color: "white",
            fontSize: "17px",
            fontWeight: 900,
            cursor: "pointer",
            boxShadow: props.editingId
              ? "0 8px 20px rgba(245,158,11,0.25)"
              : "0 8px 20px rgba(22,163,74,0.25)",
          }}
        >
          {props.editingId
            ? "✓ Enregistrer les modifications"
            : "✓ Enregistrer l'appel"}
        </button>
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          padding: "17px 20px",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "11px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "19px",
          }}
        >
          {icon}
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "17px",
            }}
          >
            {title}
          </h3>

          <p
            style={{
              margin: "3px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <div style={{ padding: "20px" }}>{children}</div>
    </section>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: "14px",
        padding: "9px 0",
      }}
    >
      <strong style={{ color: "#64748b" }}>
        {label}
      </strong>

      <span
        style={{
          color: "#0f172a",
          fontWeight: 700,
        }}
      >
        {value}
      </span>
    </div>
  );
}