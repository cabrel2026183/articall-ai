import { supabase } from "./supabase";

type AddCallEventParams = {
  callId: string;
  eventType: string;
  title: string;
  description?: string;
  createdBy?: string;
};

export async function addCallEvent({
  callId,
  eventType,
  title,
  description,
  createdBy,
}: AddCallEventParams) {
   const { error } = await supabase
    .from("call_events")
    .insert({
      call_id: callId,
      event_type: eventType,
      title,
      description,
      created_by: createdBy ?? null,
    });

  if (error) {
    console.error("Erreur call_events :", error);
    throw error;
  }
}