"use client";

import {
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";

import Card from "../ui/Card";
import type { Call } from "../../lib/types";

type ClientCardProps = {
  call: Call;
};

export default function ClientCard({ call }: ClientCardProps) {
  const mapsUrl = call.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        call.address
      )}`
    : "";

  return (
    <Card>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UserRound size={21} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">
            Informations client
          </p>

          <h2 className="text-xl font-bold text-slate-900">
            {call.client_name || "Client non renseigné"}
          </h2>
        </div>
      </div>

      <div className="grid gap-3">
        <InfoRow
          icon={<Phone size={18} />}
          label="Téléphone"
          value={call.client_phone || "Non renseigné"}
        />

        <InfoRow
          icon={<Mail size={18} />}
          label="Email"
          value={call.client_email || "Non renseigné"}
        />

        <InfoRow
          icon={<MapPin size={18} />}
          label="Adresse"
          value={call.address || "Non renseignée"}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
        {call.client_phone && (
          <a
            href={`tel:${call.client_phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Phone size={17} />
            Appeler
          </a>
        )}

        {call.client_email && (
          <a
            href={`mailto:${call.client_email}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Mail size={17} />
            Envoyer un email
          </a>
        )}

        {call.address && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink size={17} />
            Itinéraire
          </a>
        )}
      </div>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <div className="mt-0.5 text-slate-500">{icon}</div>

      <div className="min-w-0">
        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}