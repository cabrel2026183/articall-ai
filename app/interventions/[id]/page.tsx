"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import type { AuthUser, Call } from "../../../lib/types";

import MainLayout from "../../../components/MainLayout";
import DocumentActions from "../../../components/documents/DocumentActions";

import InterventionHeader from "../../../components/intervention/Header";
import ClientCard from "../../../components/intervention/ClientCard";
import DiagnosticCard from "../../../components/intervention/DiagnosticCard";
import PaymentCard from "../../../components/intervention/PaymentCard";
import PhotosCard from "../../../components/intervention/PhotosCard";
import SignatureCard from "../../../components/intervention/SignatureCard";
import ActionsCard from "../../../components/intervention/ActionsCard";
import InterventionProgressCard from "../../../components/intervention/InterventionProgressCard";
import TimelineCard from "../../../components/intervention/TimelineCard";
import EditInterventionModal from "../../../components/intervention/EditInterventionModal";
import NotesCard from "../../../components/intervention/NotesCard";
import ProblemCard from "../../../components/intervention/ProblemCard";

export default function InterventionPage() {
  const params = useParams<{ id: string }>();

  const interventionRef =
    useRef<HTMLDivElement | null>(null);

  const [call, setCall] = useState<Call | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState("");
  const [timelineRefreshKey, setTimelineRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] =
    useState(false);
  const [telechargement, setTelechargement] =
    useState(false);

  useEffect(() => {
    async function chargerPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      const email =
        user.email?.toLowerCase().trim();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .maybeSingle();
        
const roleFinal = profile?.role || "technicien";

      setRole(roleFinal);

      const { data: intervention, error } =
        await supabase
          .from("calls")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();

      if (error) {
        console.error(
          "Erreur chargement intervention :",
          error
        );
      }

      setCall(intervention || null);
      setLoading(false);
    }

    if (params.id) {
      chargerPage();
    }
  }, [params.id]);

  async function telechargerPDF() {
    if (!interventionRef.current || !call) {
      alert(
        "Le document d’intervention est introuvable."
      );
      return;
    }

    try {
      setTelechargement(true);

      const html2canvasModule =
        await import("html2canvas");
      const jsPDFModule = await import("jspdf");

      const html2canvas =
        html2canvasModule.default;
      const jsPDF = jsPDFModule.default;

      const canvas = await html2canvas(
        interventionRef.current,
        {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        }
      );

      const imageData = canvas.toDataURL(
        "image/jpeg",
        0.95
      );

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 8;

      const imageWidth =
        pageWidth - margin * 2;

      const imageHeight =
        (canvas.height * imageWidth) /
        canvas.width;

      let remainingHeight = imageHeight;
      let positionY = margin;

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        positionY,
        imageWidth,
        imageHeight
      );

      remainingHeight -=
        pageHeight - margin * 2;

      while (remainingHeight > 0) {
        pdf.addPage();

        positionY =
          margin -
          (imageHeight - remainingHeight);

        pdf.addImage(
          imageData,
          "JPEG",
          margin,
          positionY,
          imageWidth,
          imageHeight
        );

        remainingHeight -=
          pageHeight - margin * 2;
      }

      const client =
        call.client_name
          ?.trim()
          .replace(/[^a-zA-Z0-9À-ÿ_-]+/g, "-") ||
        "client";

      pdf.save(
        `intervention-${client}-${call.id.slice(
          0,
          8
        )}.pdf`
      );
    } catch (error) {
      console.error(
        "Erreur téléchargement PDF :",
        error
      );

      alert(
        error instanceof Error
          ? `Impossible de télécharger le PDF : ${error.message}`
          : "Impossible de télécharger le PDF."
      );
    } finally {
      setTelechargement(false);
    }
  }

  if (loading) {
    return (
      <MainLayout user={user} role={role}>
        <p>
          Chargement de l’intervention...
        </p>
      </MainLayout>
    );
  }

  if (!call) {
    return (
      <MainLayout user={user} role={role}>
        <h1>Intervention introuvable</h1>
      </MainLayout>
    );
  }

  const isMobile =
    typeof window !== "undefined" &&
    window.innerWidth < 900;

  return (
    <>
      <style jsx global>{`
        @media print {
          .intervention-no-print {
            display: none !important;
          }

          header,
          nav,
          aside {
            display: none !important;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .intervention-document {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <MainLayout
        user={user}
        role={role}
        calls={[call]}
      >
        <div className="intervention-no-print">
          <DocumentActions
            retourHref="/"
            telechargement={telechargement}
            onTelecharger={telechargerPDF}
            onImprimer={() => window.print()}
          />

          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto 18px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setEditOpen(true)
              }
              style={{
                padding: "11px 15px",
                borderRadius: "10px",
                border:
                  "1px solid #cbd5e1",
                background: "white",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✏️ Modifier
            </button>

            <Link
              href={`/devis/nouveau?callId=${call.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 15px",
                borderRadius: "10px",
                backgroundColor: "#2563eb",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              📄 Créer un devis
            </Link>

            <Link
              href={`/factures/${call.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 15px",
                borderRadius: "10px",
                backgroundColor: "#0f172a",
                color: "white",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              🧾 Facture
            </Link>
          </div>
        </div>

        <div
          ref={interventionRef}
          className="intervention-document"
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
          }}
        >
          <InterventionHeader call={call} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "minmax(0, 1.6fr) minmax(320px, 1fr)",
              gap: "24px",
              alignItems: "start",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <ClientCard call={call} />
              <ProblemCard call={call} />
              <DiagnosticCard call={call} />
              <PhotosCard call={call} />
              <SignatureCard call={call} />
            </div>

            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              <PaymentCard call={call} />

              <InterventionProgressCard
                status={call.status}
              />

              <div className="intervention-no-print">
               
  <ActionsCard
  call={call}
  role={role}
  onEdit={() =>
    setEditOpen(true)
  }
  onStatusUpdated={(newStatus) =>
    setCall((currentCall) =>
      currentCall
        ? {
            ...currentCall,
            status: newStatus as Call["status"],
          }
        : currentCall
    )
  }
  onTimelineUpdated={() =>
    setTimelineRefreshKey(
      (value) => value + 1
    )
  }
/>
              </div>

              <TimelineCard
  call={call}
  refreshKey={timelineRefreshKey}
/>
              <NotesCard call={call} />
            </div>
          </div>
        </div>

        <EditInterventionModal
          call={call}
          open={editOpen}
          role={role}
          onClose={() =>
            setEditOpen(false)
          }
          onUpdated={(updatedCall) =>
            setCall(updatedCall)
          }
        />
      </MainLayout>
    </>
  );
}