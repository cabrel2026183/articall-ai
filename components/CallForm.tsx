"use client";

import ClientFields from "./ClientFields";
import InterventionFields from "./InterventionFields";
import PaymentFields from "./PaymentFields";
import TechnicianFields from "./TechnicianFields";

type CallFormProps = {
  editingId: string | null;

  clientName: string;
  setClientName: (value: string) => void;

  clientPhone: string;
  setClientPhone: (value: string) => void;

  clientEmail: string;
  setClientEmail: (value: string) => void;

  problem: string;
  setProblem: (value: string) => void;

  interventionDate: string;
  setInterventionDate: (value: string) => void;

  urgency: string;
  setUrgency: (value: string) => void;

  amount: string;
  setAmount: (value: string) => void;

  paymentStatus: string;
  setPaymentStatus: (value: string) => void;

  technician: string;
  setTechnician: (value: string) => void;

  setPhoto: (file: File | null) => void;

  ajouterAppel: () => void;
};

export default function CallForm(props: CallFormProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "15px",
        marginBottom: "20px",
      }}
    >
      <h3>Nouvel appel</h3>
            <ClientFields
        clientName={props.clientName}
        setClientName={props.setClientName}
        clientPhone={props.clientPhone}
        setClientPhone={props.setClientPhone}
        clientEmail={props.clientEmail}
        setClientEmail={props.setClientEmail}
      />

      <InterventionFields
        problem={props.problem}
        setProblem={props.setProblem}
        interventionDate={props.interventionDate}
        setInterventionDate={props.setInterventionDate}
        urgency={props.urgency}
        setUrgency={props.setUrgency}
      />

      <PaymentFields
        amount={props.amount}
        setAmount={props.setAmount}
        paymentStatus={props.paymentStatus}
        setPaymentStatus={props.setPaymentStatus}
      />

      <TechnicianFields
        technician={props.technician}
        setTechnician={props.setTechnician}
        setPhoto={props.setPhoto}
      />

      <button onClick={props.ajouterAppel}>
        {props.editingId
          ? "Modifier l'appel"
          : "Enregistrer l'appel"}
      </button>
    </div>
  );
}