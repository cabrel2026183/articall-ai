"use client";

import Link from "next/link";

type DocumentActionsProps = {
  retourHref: string;
  paiementLabel?: string;
  paiementDisabled?: boolean;
  telechargement?: boolean;
  onPaiement?: () => void;
  onTelecharger?: () => void;
  onImprimer?: () => void;
  onEnvoyer?: () => void;
};

export default function DocumentActions({
  retourHref,
  paiementLabel,
  paiementDisabled = false,
  telechargement = false,
  onPaiement,
  onTelecharger,
  onImprimer,
  onEnvoyer,
}: DocumentActionsProps) {
  return (
    <div
      className="document-actions no-print"
      style={{
        maxWidth: "1000px",
        margin: "0 auto 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <Link
        href={retourHref}
        style={{
          padding: "11px 15px",
          borderRadius: "10px",
          backgroundColor: "white",
          border: "1px solid #cbd5e1",
          color: "#334155",
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        ← Retour
      </Link>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {onPaiement && paiementLabel && (
          <button
            type="button"
            onClick={onPaiement}
            disabled={paiementDisabled}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#fef3c7",
              color: "#92400e",
              fontWeight: 800,
              cursor: paiementDisabled
                ? "not-allowed"
                : "pointer",
              opacity: paiementDisabled ? 0.6 : 1,
            }}
          >
            {paiementLabel}
          </button>
        )}

        {onTelecharger && (
          <button
            type="button"
            onClick={onTelecharger}
            disabled={telechargement}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: 800,
              cursor: telechargement
                ? "not-allowed"
                : "pointer",
              opacity: telechargement ? 0.6 : 1,
            }}
          >
            {telechargement
              ? "Création du PDF..."
              : "📥 Télécharger PDF"}
          </button>
        )}

        {onImprimer && (
          <button
            type="button"
            onClick={onImprimer}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              backgroundColor: "white",
              color: "#334155",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            🖨️ Imprimer
          </button>
        )}

        {onEnvoyer && (
          <button
            type="button"
            onClick={onEnvoyer}
            style={{
              padding: "11px 15px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#0f172a",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            📧 Envoyer
          </button>
        )}
      </div>
    </div>
  );
}