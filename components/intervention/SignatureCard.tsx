"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Card from "../ui/Card";
import { addCallEvent } from "../../lib/callEvents";
import SignaturePad from "../SignaturePad";
import type { Call } from "../../lib/types";

type SignatureCardProps = {
  call: Call;
};

export default function SignatureCard({ call }: SignatureCardProps) {
  const [signatureUrl, setSignatureUrl] = useState(
    call.signature_url || ""
  );

  const [showSignaturePad, setShowSignaturePad] =
    useState(false);

  const [saving, setSaving] = useState(false);

  async function enregistrerSignature(
    signatureDataUrl: string
  ) {
    setSaving(true);

    const { error } = await supabase
      .from("calls")
      .update({
  signature_url: signatureDataUrl,
  signature_date: new Date().toISOString(),
})
      .eq("id", call.id);

    setSaving(false);

    if (error) {
      alert(
        "Erreur lors de l’enregistrement : " +
          error.message
      );
      return;
    }

    setSignatureUrl(signatureDataUrl);
    setShowSignaturePad(false);

    await addCallEvent({
  callId: call.id,
  eventType: "signature",
  title: "Signature du client",
  description: "Le client a signé le bon d'intervention.",
});

    alert("✅ Signature enregistrée");
  }
  

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>
        ✍️ Signature du client
      </h3>

      {signatureUrl ? (
        <div
          style={{
            minHeight: "180px",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "12px",
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={signatureUrl}
            alt="Signature du client"
            style={{
              maxWidth: "100%",
              maxHeight: "170px",
              objectFit: "contain",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            height: "180px",
            border: "2px dashed #cbd5e1",
            borderRadius: "14px",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
          }}
        >
          Aucune signature
        </div>
      )}

      {!showSignaturePad && (
        <button
          type="button"
          onClick={() => setShowSignaturePad(true)}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "12px",
            border: "none",
            borderRadius: "12px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          {signatureUrl
            ? "✍️ Remplacer la signature"
            : "✍️ Faire signer le client"}
        </button>
      )}

      {showSignaturePad && (
        <div style={{ marginTop: "18px" }}>
          <SignaturePad
            onSave={enregistrerSignature}
          />

          <button
            type="button"
            disabled={saving}
            onClick={() => setShowSignaturePad(false)}
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              background: "white",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>

          {saving && (
            <p style={{ color: "#64748b" }}>
              Enregistrement en cours...
            </p>
          )}
        </div>
      )}
    </Card>
  );
}