"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { genererResumeIntervention } from "../../lib/ai/interventionSummary";
import { addCallEvent } from "../../lib/callEvents";
import { supabase } from "../../lib/supabase";
import { useToast } from "../providers/ToastProvider";
import ConfirmDialog from "../ui/ConfirmDialog";

import Card from "../ui/Card";
import Button from "../ui/Button";
import type { Call } from "../../lib/types";

type ActionsCardProps = {
  call: Call;
  role: string;
  onEdit: () => void;
  onStatusUpdated: (newStatus: string) => void;
  onTimelineUpdated: () => void;
};

export default function ActionsCard({
  call,
  role,
  onEdit,
  onStatusUpdated,
  onTimelineUpdated,
}: ActionsCardProps) {

  const router = useRouter();
  const { showToast } = useToast();

  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
const [deleting, setDeleting] = useState(false);
const [showFinishDialog, setShowFinishDialog] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);

const [quoteLieeId, setQuoteLieeId] = useState<string | null>(null);
const [factureLiee, setFactureLiee] = useState<{
  id: string;
  total_amount: number | null;
  status: string | null;
} | null>(null);

useEffect(() => {
  chargerFactureLiee();
}, [call.id]);

async function chargerFactureLiee() {
  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .select("id")
    .eq("call_id", call.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (quoteError || !quoteData) {
    setQuoteLieeId(null);
    setFactureLiee(null);
    return;
  }

  setQuoteLieeId(quoteData.id);

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, total_amount, status")
    .eq("quote_id", quoteData.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{
      id: string;
      total_amount: number | null;
      status: string | null;
    }>();

  if (invoiceError) {
    console.error(
      "Erreur chargement facture liée :",
      invoiceError
    );
    setFactureLiee(null);
    return;
  }

  setFactureLiee(invoiceData || null);
}

function ajouterImageOptimisee(
  doc: jsPDF,
  imageData: string,
  format: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) {
  return new Promise<number>((resolve) => {
    const image = new Image();

    image.onload = () => {
      const ratio = Math.min(
  maxWidth / image.width,
  maxHeight / image.height,
  1
);

      const width = image.width * ratio;
      const height = image.height * ratio;

      doc.addImage(
        imageData,
        format,
        x,
        y,
        width,
        height
      );

      resolve(height);
    };

    image.src = imageData;
  });
}

 async function creerBonIntervention() {
  const doc = new jsPDF();

  const { data: company } = await supabase
  .from("company_settings")
  .select("*")
  .limit(1)
  .maybeSingle();

  const resumeAutomatique = genererResumeIntervention({
  client_name: call.client_name,
  problem: call.problem,
  notes: call.internal_notes,
  work_done: call.intervention_report,
  technician: call.technician,
  payment_status: factureLiee?.status ?? null,
  status: call.status,
});

  const statutLisible =
    call.status === "termine" || call.status === "completed"
      ? "Terminée"
      : call.status === "in_progress"
        ? "Intervention en cours"
        : call.status === "arrived"
          ? "Technicien arrivé"
          : call.status === "en_route"
            ? "Technicien en route"
            : call.status === "planifie" ||
                call.status === "scheduled"
              ? "Planifiée"
              : "Nouvelle";

  const paiementLisible = !factureLiee
    ? "Aucune facture émise"
    : factureLiee.status === "paye"
      ? "Payé"
      : factureLiee.status === "partiel"
        ? "Paiement partiel"
        : "À encaisser";

  const dateIntervention = call.intervention_date
    ? new Date(call.intervention_date).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Non planifiée";

  const dateFin = call.completed_at
    ? new Date(call.completed_at).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "Non terminée";

    const couleurEntreprise =
  company?.primary_color || "#2563eb";

function convertirHexEnRgb(
  hex: string
): [number, number, number] {
  const couleur = hex.replace("#", "");

  const valeur =
    couleur.length === 3
      ? couleur
          .split("")
          .map((caractere) => caractere + caractere)
          .join("")
      : couleur;

  const nombre = Number.parseInt(valeur, 16);

  if (Number.isNaN(nombre)) {
    return [37, 99, 235];
  }

  return [
    (nombre >> 16) & 255,
    (nombre >> 8) & 255,
    nombre & 255,
  ];
}

const couleurRgb =
  convertirHexEnRgb(couleurEntreprise);

let positionTexteEntreprise = 20;

if (company?.logo_url) {
  try {
    const logoImage = await chargerImage(
      company.logo_url
    );

    if (logoImage) {
      await ajouterImageOptimisee(
        doc,
        logoImage,
        detecterFormatImage(logoImage),
        20,
        15,
        45,
        25
      );

      positionTexteEntreprise = 72;
    }
  } catch (error) {
    console.error(
      "Erreur chargement logo :",
      error
    );
  }
}

doc.setTextColor(
  couleurRgb[0],
  couleurRgb[1],
  couleurRgb[2]
);

doc.setFont("helvetica", "bold");
doc.setFontSize(18);

doc.text(
  company?.company_name || "ARTICALL AI",
  positionTexteEntreprise,
  20
);

doc.setTextColor(60, 60, 60);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);

const informationsEntreprise = [
  company?.address,
  company?.phone
    ? `Téléphone : ${company.phone}`
    : null,
  company?.email
    ? `E-mail : ${company.email}`
    : null,
  company?.website
    ? `Site : ${company.website}`
    : null,
  company?.siret
    ? `SIRET : ${company.siret}`
    : null,
  company?.tva_number
    ? `TVA : ${company.tva_number}`
    : null,
].filter(Boolean) as string[];

let ligneEntrepriseY = 27;

for (const information of informationsEntreprise) {
  const largeurTexte =
    positionTexteEntreprise === 20 ? 170 : 115;

  const lignes = doc.splitTextToSize(
    information,
    largeurTexte
  );

  doc.text(
    lignes,
    positionTexteEntreprise,
    ligneEntrepriseY
  );

  ligneEntrepriseY += lignes.length * 4;
}

const finEnteteEntreprise = Math.max(
  ligneEntrepriseY + 4,
  48
);

doc.setDrawColor(
  couleurRgb[0],
  couleurRgb[1],
  couleurRgb[2]
);

doc.setLineWidth(1);

doc.line(
  20,
  finEnteteEntreprise,
  190,
  finEnteteEntreprise
);

doc.setTextColor(
  couleurRgb[0],
  couleurRgb[1],
  couleurRgb[2]
);

doc.setFont("helvetica", "bold");
doc.setFontSize(15);

doc.text(
  "RAPPORT D’INTERVENTION",
  20,
  finEnteteEntreprise + 11
);

doc.setTextColor(80, 80, 80);
doc.setFont("helvetica", "normal");
doc.setFontSize(9);

doc.text(
  `Rapport généré le ${new Date().toLocaleString(
    "fr-FR"
  )}`,
  20,
  finEnteteEntreprise + 18
);

const debutTableauGeneral =
  finEnteteEntreprise + 25;

 

  autoTable(doc, {
    startY: debutTableauGeneral,
    head: [["Informations générales", "Détail"]],
    body: [
      ["Client", call.client_name || "-"],
      ["Téléphone", call.client_phone || "-"],
      ["E-mail", call.client_email || "-"],
      ["Adresse", call.address || "-"],
      ["Technicien", call.technician || "Non attribué"],
      ["Date d’intervention", dateIntervention],
      ["Date de fin", dateFin],
      ["Statut", statutLisible],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
   headStyles: {
  fontStyle: "bold",
  fillColor: couleurRgb,
  textColor: [255, 255, 255],
},
  });

  const informationsTableFinalY =
    (doc as any).lastAutoTable?.finalY || 120;

  autoTable(doc, {
    startY: informationsTableFinalY + 10,
    head: [["Intervention", "Description"]],
    body: [
      ["Problème signalé", call.problem || "Aucun problème renseigné"],
      [
        "Travaux réalisés",
        call.intervention_report ||
          call.summary ||
          "Aucun compte-rendu renseigné",
      ],
      [
        "Notes du technicien",
        call.internal_notes || "Aucune note renseignée",
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
      overflow: "linebreak",
    },
    columnStyles: {
      0: {
        cellWidth: 45,
        fontStyle: "bold",
      },
      1: {
        cellWidth: 135,
      },
    },
  });

  const interventionTableFinalY =
    (doc as any).lastAutoTable?.finalY || 190;

    doc.setFontSize(14);
doc.text(
  "Résumé de l'intervention",
  20,
  interventionTableFinalY + 12
);

doc.setFontSize(11);

const resumeLignes = doc.splitTextToSize(
  resumeAutomatique || "Aucun résumé disponible.",
  170
);

doc.text(
  resumeLignes,
  20,
  interventionTableFinalY + 22
);

  autoTable(doc, {
  startY:
    interventionTableFinalY +
    35 +
    resumeLignes.length * 6,
    head: [["Paiement", "Détail"]],
    body: [
      [
        "Montant total",
        factureLiee
          ? `${factureLiee.total_amount ?? 0} €`
          : "Aucune facture émise",
      ],
      ["Statut du paiement", paiementLisible],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
  });

  const paiementTableFinalY =
  (doc as any).lastAutoTable?.finalY || 220;

  if (
  call.photo_before_url ||
  call.photo_after_url ||
  call.signature_url
) {
  const pageHeight = doc.internal.pageSize.height;
  const margeBasse = 25;

  const imageBefore = call.photo_before_url
    ? await chargerImage(call.photo_before_url)
    : null;

  const imageAfter = call.photo_after_url
    ? await chargerImage(call.photo_after_url)
    : null;

  const signatureImage = call.signature_url
    ? await chargerImage(call.signature_url)
    : null;

  const photosPresentes = Boolean(imageBefore || imageAfter);

  const hauteurPhotosReservee = photosPresentes ? 75 : 0;
  const hauteurSignatureReservee = signatureImage ? 65 : 0;

  const hauteurNecessaire =
    18 +
    hauteurPhotosReservee +
    hauteurSignatureReservee;

  let positionY = paiementTableFinalY + 14;

  if (
    positionY + hauteurNecessaire >
    pageHeight - margeBasse
  ) {
    doc.addPage();
    positionY = 20;
  }

  doc.setFontSize(15);
  doc.text("PHOTOS ET SIGNATURE", 20, positionY);

  positionY += 12;

  let hauteurPhotoAvant = 0;
  let hauteurPhotoApres = 0;

  if (imageBefore) {
    doc.setFontSize(11);
    doc.text("Photo avant", 20, positionY);

    hauteurPhotoAvant = await ajouterImageOptimisee(
      doc,
      imageBefore,
      detecterFormatImage(imageBefore),
      20,
      positionY + 6,
      80,
      55
    );
  }

  if (imageAfter) {
    doc.setFontSize(11);
    doc.text("Photo après", 110, positionY);

    hauteurPhotoApres = await ajouterImageOptimisee(
      doc,
      imageAfter,
      detecterFormatImage(imageAfter),
      110,
      positionY + 6,
      80,
      55
    );
  }

  if (imageBefore || imageAfter) {
    positionY +=
      Math.max(
        hauteurPhotoAvant,
        hauteurPhotoApres
      ) + 18;
  }

  if (signatureImage) {
    if (positionY + 55 > pageHeight - margeBasse) {
      doc.addPage();
      positionY = 20;
    }

    doc.setFontSize(11);
    doc.text("Signature du client", 20, positionY);

    const hauteurSignature =
      await ajouterImageOptimisee(
        doc,
        signatureImage,
        detecterFormatImage(signatureImage),
        20,
        positionY + 6,
        80,
        40
      );

    positionY += hauteurSignature + 12;

    if (call.signature_date) {
      doc.setFontSize(10);
      doc.text(
        `Signé le ${new Date(
          call.signature_date
        ).toLocaleString("fr-FR")}`,
        20,
        positionY
      );
    }
  }
}

  const nombrePages = doc.getNumberOfPages();

  for (let page = 1; page <= nombrePages; page++) {
    doc.setPage(page);

    doc.setFontSize(9);

    doc.text(
      "Document généré par ArtiCall AI.",
      20,
      doc.internal.pageSize.height - 12
    );

    doc.text(
      `Page ${page} / ${nombrePages}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 12
    );
  }

  return doc;
}

  async function genererBonIntervention() {
    setGenerating(true);

    try {
      const doc = await creerBonIntervention();

      doc.save(
        `bon-intervention-${nettoyerNom(
          call.client_name || "client"
        )}.pdf`
      );
    } catch (error) {
      console.error(error);
      alert("Erreur pendant la génération du bon d’intervention.");
    } finally {
      setGenerating(false);
    }
  }

  async function envoyerBonParEmail() {
    if (!call.client_email) {
      alert("Aucune adresse e-mail n’est renseignée pour ce client.");
      return;
    }

        setSending(true);

    try {
      const doc = await creerBonIntervention();

      const pdfBase64 = doc.output("datauristring").split(",")[1];

      const filename = `bon-intervention-${nettoyerNom(
        call.client_name || "client"
      )}.pdf`;

      const response = await fetch("/api/send-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: call.client_email,
          clientName: call.client_name,
          pdfBase64,
          filename,
          subject: "Votre bon d’intervention ArtiCall AI",
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(
          "Erreur lors de l’envoi : " +
            (result.error || result.message || "Erreur inconnue")
        );

                return;
      }

      showToast({
  type: "success",
  title: "Bon envoyé",
  message: "Le bon d’intervention a été envoyé au client.",
});
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue pendant l’envoi de l’e-mail.");
    } finally {
      setSending(false);
    }
  }

  async function mettreTechnicienEnRoute() {
  if (call.status === "en_route") {
    showToast({
      type: "info",
      title: "Déjà en route",
      message: "Le technicien est déjà indiqué comme étant en route.",
    });
    return;
  }

  setUpdatingStatus(true);

  try {
    const { error } = await supabase
      .from("calls")
      .update({
  status: "en_route",
  en_route_at: new Date().toISOString(),
})
      .eq("id", call.id);

    if (error) {
      throw error;
    }

    onStatusUpdated("en_route");

    await addCallEvent({
      callId: call.id,
      eventType: "en_route",
      title: "Technicien en route",
      description: "Le technicien est en route vers le client.",
    });

    onTimelineUpdated();

    showToast({
      type: "success",
      title: "Technicien en route",
      message: "Le statut et la Timeline ont été mis à jour.",
    });

    router.refresh();
  } catch (error) {
    console.error("Erreur mise en route :", error);

    showToast({
      type: "error",
      title: "Une erreur est survenue",
      message:
        error instanceof Error
          ? error.message
          : "Impossible de modifier le statut.",
    });
  } finally {
    setUpdatingStatus(false);
  }
}

async function marquerTechnicienArrive() {
  const { error } = await supabase
    .from("calls")
     .update({
  status: "arrived",
  arrived_at: new Date().toISOString(),
})
    .eq("id", call.id);

  if (error) {
    console.error(error);
    alert("Erreur lors du changement de statut.");
    return;
  }

 onStatusUpdated("arrived");

  await addCallEvent({
    callId: call.id,
    eventType: "arrived",
    title: "Technicien arrivé",
    description: "Le technicien est arrivé chez le client.",
  });

  onTimelineUpdated();

  router.refresh();
  alert("Le technicien est arrivé.");
}

async function demarrerIntervention() {
  const { error } = await supabase
    .from("calls")
   .update({
  status: "in_progress",
  started_at: new Date().toISOString(),
})
    .eq("id", call.id);

  if (error) {
    console.error(error);
    alert("Erreur lors du démarrage de l’intervention.");
    return;
  }

  onStatusUpdated("in_progress");

  await addCallEvent({
    callId: call.id,
    eventType: "in_progress",
    title: "Intervention démarrée",
    description: "Le technicien a commencé l’intervention.",
  });

  onTimelineUpdated();

  router.refresh();
  alert("L’intervention a commencé.");
}

async function passerEtapeSuivante() {
  const status = call.status?.toLowerCase().trim();

  if (
    status === "nouveau" ||
    status === "pending" ||
    status === "assigned" ||
    status === "planifie" ||
    status === "scheduled"
  ) {
    await mettreTechnicienEnRoute();
    return;
  }

  if (status === "en_route") {
    await marquerTechnicienArrive();
    return;
  }

  if (status === "arrived") {
    await demarrerIntervention();
    return;
  }

  if (status === "in_progress") {
    await terminerIntervention();
    return;
  }

  if (status === "termine" || status === "completed") {
    return;
  }

  alert(`Statut non reconnu : ${call.status}`);
}

  async function terminerIntervention() {
  if (call.status === "termine") {
    alert("Cette intervention est déjà terminée.");
    return;
  }

    setUpdatingStatus(true);

  const { error } = await supabase
    .from("calls")
    .update({
      status: "termine",
      completed_at: new Date().toISOString(),
    })
    .eq("id", call.id);

  setUpdatingStatus(false);

  if (error) {
    showToast({
  type: "error",
  title: "Une erreur est survenue",
  message: error.message,
});
    return;
  }

 try {
  const { data: existingEvent, error: checkError } = await supabase
    .from("call_events")
    .select("id")
    .eq("call_id", call.id)
    .eq("event_type", "completed")
    .limit(1)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  if (!existingEvent) {

    onStatusUpdated("termine");

    await addCallEvent({
      callId: call.id,
      eventType: "completed",
      title: "Intervention terminée",
      description: "L’intervention a été marquée comme terminée.",
    });

    onTimelineUpdated();

  }
} catch (error) {
  console.error("Erreur addCallEvent :", error);

  showToast({
    type: "error",
    title: "Erreur Timeline",
    message: String(error),
  });
}

  showToast({
  type: "success",
  title: "Intervention terminée",
  message: "Le statut a été mis à jour avec succès.",
});
  router.refresh();
}

async function supprimerIntervention() {
   setDeleting(true);

  const { error } = await supabase
    .from("calls")
    .delete()
    .eq("id", call.id);

  setDeleting(false);

  if (error) {
    alert("Erreur : " + error.message);
    return;
  }

 showToast({
  type: "success",
  title: "Intervention supprimée",
  message: "L’intervention a été supprimée définitivement.",
});
  router.push("/");
}

  const obtenirTexteEtapeSuivante = () => {
  const status = call.status?.toLowerCase().trim();

  switch (status) {
    case "nouveau":
    case "pending":
    case "assigned":
    case "planifie":
    case "scheduled":
      return "🚗 Mettre le technicien en route";

    case "en_route":
      return "📍 Marquer le technicien arrivé";

    case "arrived":
      return "🔧 Démarrer l’intervention";

    case "in_progress":
      return "✅ Terminer l’intervention";

    case "termine":
    case "completed":
      return "🔒 Intervention terminée";

    default:
      return `➡️ Étape suivante (${call.status || "sans statut"})`;
  }
};

const isTechnician =
  role === "technicien";

const isAdmin =
  role === "admin";

  return (
    <Card>
      <h3 style={{ marginTop: 0 }}>Actions rapides</h3>

     
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >

     {isTechnician && (
  <>
    {["termine", "completed"].includes(
      call.status?.toLowerCase().trim() ?? ""
    ) ? (
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          background: "#e5e7eb",
          color: "#6b7280",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        🔒 Intervention terminée
      </div>
    ) : (
      <Button
        onClick={passerEtapeSuivante}
      >
        {obtenirTexteEtapeSuivante()}
      </Button>
    )}
  </>
)}
        <Button
          variant="secondary"
          onClick={genererBonIntervention}
        >
          {generating ? "Génération..." : "Bon PDF"}
        </Button>

        <Button
  variant="secondary"
  onClick={() => {
    if (factureLiee) {
      router.push(`/factures/${factureLiee.id}`);
      return;
    }

    if (quoteLieeId) {
      router.push(`/devis/${quoteLieeId}`);
      return;
    }

    showToast({
      type: "info",
      title: "Aucun devis",
      message:
        "Créez d'abord un devis pour cette intervention avant de générer une facture.",
    });
  }}
>
  🧾 Facture
</Button>

        <Button
          variant="secondary"
          onClick={envoyerBonParEmail}
        >
          {sending ? "Envoi en cours..." : "Envoyer le bon"}
        </Button>

        {call.client_phone && (
          <a href={`tel:${call.client_phone}`}>
            <Button variant="success">Appeler</Button>
          </a>
        )}

        {call.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              call.address
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary">Google Maps</Button>
          </a>
        )}
               
       
<Button
  variant="danger"
  onClick={() => setShowDeleteDialog(true)}
>
  {deleting ? "Suppression..." : "Supprimer"}
</Button>

        <Button
          variant="secondary"
          onClick={() => router.push("/")}
        >
          Retour
        </Button>
      </div>
      <ConfirmDialog
  open={showFinishDialog}
  title="Terminer l'intervention"
  message="Cette action marquera définitivement l'intervention comme terminée."
  confirmLabel="Oui, terminer"
  variant="success"
  loading={updatingStatus}
  onCancel={() => setShowFinishDialog(false)}
  onConfirm={async () => {
    setShowFinishDialog(false);
    await terminerIntervention();
  }}
/>

<ConfirmDialog
  open={showDeleteDialog}
  title="Supprimer l'intervention"
  message="Cette action est irréversible. Toutes les données liées à cette intervention seront supprimées."
  confirmLabel="Supprimer définitivement"
  variant="danger"
  loading={deleting}
  onCancel={() => setShowDeleteDialog(false)}
  onConfirm={async () => {
    setShowDeleteDialog(false);
    await supprimerIntervention();
  }}
/>
    </Card>
  );
}

async function chargerImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Impossible de charger l’image :", error);
    return null;
  }
}

function detecterFormatImage(
  imageData: string
): "PNG" | "JPEG" {
  return imageData.startsWith("data:image/png")
    ? "PNG"
    : "JPEG";
}

function nettoyerNom(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}