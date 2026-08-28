"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import { useRouter } from "next/navigation";
import type { Call } from "../lib/types";

type CalendarViewProps = {
  calls: Call[];
};

export default function CalendarView({
  calls,
}: CalendarViewProps) {
  const router = useRouter();

  return (
    <>
      <h2>📅 Calendrier des interventions</h2>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        height="auto"
        eventDisplay="block"
        events={calls
          .filter(
            (call): call is typeof call & { intervention_date: string } =>
              Boolean(call.intervention_date)
          )
          .map((call) => ({
            id: call.id,
            title:
              call.client_name ||
              "Client non renseigné",
            date: call.intervention_date,
            color:
              call.urgency === "urgent"
                ? "red"
                : call.urgency === "important"
                  ? "orange"
                  : "green",
            extendedProps: {
              callId: call.id,
            },
          }))}
        eventClick={(info) => {
          const callId =
            info.event.extendedProps.callId;

          if (!callId) return;

          router.push(
            `/interventions/${callId}`
          );
        }}
      />
    </>
  );
}