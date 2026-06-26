"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";

type CalendarViewProps = {
  calls: any[];
  setSelectedCall: (call: any) => void;
};

export default function CalendarView({
  calls,
  setSelectedCall,
}: CalendarViewProps) {
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
          .filter((call) => call.intervention_date)
          .map((call) => ({
            title: `${call.client_name}`,
            date: call.intervention_date,
            color:
              call.urgency === "urgent"
                ? "red"
                : call.urgency === "important"
                ? "orange"
                : "green",
            extendedProps: {
              call,
            },
          }))}
        eventClick={(info) => {
          setSelectedCall(info.event.extendedProps.call);
        }}
      />
    </>
  );
}