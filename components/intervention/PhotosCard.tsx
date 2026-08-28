"use client";

import { useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import Card from "../ui/Card";
import { addCallEvent } from "../../lib/callEvents";
import type { Call } from "../../lib/types";

type PhotosCardProps = {
  call: Call;
};

export default function PhotosCard({ call }: PhotosCardProps) {
  const [photoBeforeUrl, setPhotoBeforeUrl] = useState(
    call.photo_before_url || ""
  );

  const [photoAfterUrl, setPhotoAfterUrl] = useState(
    call.photo_after_url || ""
  );

  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  async function uploadPhoto(
    file: File,
    type: "before" | "after"
  ) {
    const setUploading =
      type === "before"
        ? setUploadingBefore
        : setUploadingAfter;

    setUploading(true);

    try {
      const extension = file.name.split(".").pop() || "jpg";
      const fileName = `${call.id}/${type}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("interventions")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        alert("Erreur d’envoi : " + uploadError.message);
        return;
      }

            const { data } = supabase.storage
        .from("interventions")
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      const column =
        type === "before"
          ? "photo_before_url"
          : "photo_after_url";

      const { error: updateError } = await supabase
        .from("calls")
        .update({
          [column]: photoUrl,
        })
        .eq("id", call.id);

      if (updateError) {
        alert(
          "La photo a été envoyée, mais l’enregistrement a échoué : " +
            updateError.message
        );
        return;
      }

      try {
  await addCallEvent({
    callId: call.id,
    eventType: type === "before" ? "photo_before" : "photo_after",
    title:
      type === "before"
        ? "Photo avant ajoutée"
        : "Photo après ajoutée",
    description:
      type === "before"
        ? "Une photo avant intervention a été enregistrée."
        : "Une photo après intervention a été enregistrée.",
  });
} catch (error) {
  console.error("Événement photo non enregistré :", error);
}

      if (type === "before") {
        setPhotoBeforeUrl(photoUrl);
      } else {
        setPhotoAfterUrl(photoUrl);
      }

      alert(
        type === "before"
          ? "✅ Photo avant enregistrée"
          : "✅ Photo après enregistrée"
      );
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue pendant l’envoi.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>📸 Photos</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
          marginTop: "20px",
        }}
      >
        <PhotoBox
          title="Avant"
          image={photoBeforeUrl}
          loading={uploadingBefore}
          onSelect={(file) => uploadPhoto(file, "before")}
        />

        <PhotoBox
          title="Après"
          image={photoAfterUrl}
          loading={uploadingAfter}
          onSelect={(file) => uploadPhoto(file, "after")}
        />
      </div>
    </Card>
  );
}

type PhotoBoxProps = {
  title: string;
  image?: string;
  loading: boolean;
  onSelect: (file: File) => void;
};

function PhotoBox({
  title,
  image,
  loading,
  onSelect,
}: PhotoBoxProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(file?: File) {
    if (file) {
      onSelect(file);
    }
  }

  return (
    <div>
      <p
        style={{
          marginBottom: "8px",
          fontWeight: "700",
          color: "#0f172a",
        }}
      >
        Photo {title.toLowerCase()}
      </p>

      <div
        style={{
          height: "190px",
          border: "2px dashed #cbd5e1",
          borderRadius: "14px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={`Photo ${title.toLowerCase()}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ color: "#94a3b8" }}>
            Aucune photo
          </span>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginTop: "12px",
        }}
      >
        <button
          type="button"
          disabled={loading}
          onClick={() => cameraInputRef.current?.click()}
          style={{
            padding: "11px",
            borderRadius: "12px",
            border: "none",
            background: loading ? "#94a3b8" : "#2563eb",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
          }}
        >
          {loading ? "Envoi..." : "📷 Prendre"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => galleryInputRef.current?.click()}
          style={{
            padding: "11px",
            borderRadius: "12px",
            border: "1px solid #cbd5e1",
            background: "white",
            color: "#0f172a",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "700",
          }}
        >
          🖼️ Galerie
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={loading}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        style={{ display: "none" }}
      />

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        disabled={loading}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
        style={{ display: "none" }}
      />
    </div>
  );
}