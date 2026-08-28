"use client";

import { useEffect } from "react";

type ClientFieldsProps = {
  clientName: string;
  setClientName: (value: string) => void;

  clientPhone: string;
  setClientPhone: (value: string) => void;

  clientEmail: string;
  setClientEmail: (value: string) => void;

  address: string;
  setAddress: (value: string) => void;

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
};

export default function ClientFields({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientEmail,
  setClientEmail,
  setAddress,

  streetNumber,
  setStreetNumber,
  streetName,
  setStreetName,
  postalCode,
  setPostalCode,
  city,
  setCity,
  country,
  setCountry,
}: ClientFieldsProps) {
  useEffect(() => {
    const ligneRue = [
      streetNumber.trim(),
      streetName.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    const ligneVille = [
      postalCode.trim(),
      city.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    const adresseComplete = [
      ligneRue,
      ligneVille,
      country.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    setAddress(adresseComplete);
  }, [
    streetNumber,
    streetName,
    postalCode,
    city,
    country,
    setAddress,
  ]);

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
      }}
    >
      {/* IDENTITÉ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
        }}
      >
        <Field
          label="Nom du client"
          value={clientName}
          onChange={setClientName}
          placeholder="Ex : Mme Rosine"
        />

        <Field
          label="Téléphone"
          value={clientPhone}
          onChange={setClientPhone}
          placeholder="Ex : 06 12 34 56 78"
          type="tel"
        />

        <Field
          label="Email"
          value={clientEmail}
          onChange={setClientEmail}
          placeholder="client@email.fr"
          type="email"
        />
      </div>

      {/* ADRESSE */}
      <div
        style={{
          marginTop: "4px",
          padding: "18px",
          borderRadius: "14px",
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
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
              color: "#0f172a",
              fontSize: "15px",
            }}
          >
            📍 Adresse d’intervention
          </strong>

          <span
            style={{
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Renseignez chaque élément séparément.
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "120px minmax(240px, 2fr)",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Field
            label="N°"
            value={streetNumber}
            onChange={setStreetNumber}
            placeholder="55"
          />

          <Field
            label="Nom de la rue"
            value={streetName}
            onChange={setStreetName}
            placeholder="Rue de Lieusaint"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "160px minmax(220px, 1fr)",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Field
            label="Code postal"
            value={postalCode}
            onChange={setPostalCode}
            placeholder="77380"
          />

          <Field
            label="Ville"
            value={city}
            onChange={setCity}
            placeholder="Combs-la-Ville"
          />
        </div>

        <Field
          label="Pays"
          value={country}
          onChange={setCountry}
          placeholder="France"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: "6px",
      }}
    >
      <span
        style={{
          color: "#475569",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 12px",
          borderRadius: "9px",
          border: "1px solid #cbd5e1",
          background: "white",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </label>
  );
}