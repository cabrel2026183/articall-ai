"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

type SignaturePadProps = {
  onSave: (signatureDataUrl: string) => void;
};

export default function SignaturePad({ onSave }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas | null>(null);

  function effacer() {
    signatureRef.current?.clear();
  }

  function enregistrer() {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert("Veuillez signer avant d'enregistrer.");
      return;
    }

    const signatureDataUrl = signatureRef.current
      .getTrimmedCanvas()
      .toDataURL("image/png");

    onSave(signatureDataUrl);
  }

  return (
    <div style={{ marginTop: "15px" }}>
      <p>✍️ Signature du client</p>

      <SignatureCanvas
        ref={signatureRef}
        penColor="black"
        canvasProps={{
          width: 300,
          height: 150,
          style: {
            border: "1px solid #333",
            borderRadius: "8px",
            backgroundColor: "white",
          },
        }}
      />

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button onClick={effacer}>Effacer</button>
        <button onClick={enregistrer}>Enregistrer signature</button>
      </div>
    </div>
  );
}