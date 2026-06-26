"use client";

type ClientFieldsProps = {
  clientName: string;

  setClientName: (value: string) => void;
  clientPhone: string;

  setClientPhone: (value: string) => void;
  clientEmail: string;
  setClientEmail: (value: string) => void;

  address: string;
setAddress: (value: string) => void;
};

export default function ClientFields({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  address,
setAddress,
}: ClientFieldsProps) {
  return (
    <>
      <input
        type="text"
        placeholder="Nom du client"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
          width: "300px",
        }}
      />

      <input
        type="text"
        placeholder="Téléphone"
        value={clientPhone}
        onChange={(e) => setClientPhone(e.target.value)}
        style={{
          display: "block",
          marginBottom: "10px",
          width: "300px",
        }}
      />

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
      <input
  type="text"
  placeholder="Adresse du client"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  style={{
    display: "block",
    marginBottom: "10px",
    width: "300px",
  }}
/>
    </>
  );
}