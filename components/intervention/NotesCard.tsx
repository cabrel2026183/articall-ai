"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Card from "../ui/Card";
import { supabase } from "../../lib/supabase";
import type { Call } from "../../lib/types";

type NotesCardProps = {
  call: Call;
};

type MessageInterne = {
  id: string;
  call_id: string;
  user_id: string | null;
  author_name: string | null;
  author_role: string | null;
  message: string;
  created_at: string;
};

export default function NotesCard({
  call,
}: NotesCardProps) {
  const [messages, setMessages] =
    useState<MessageInterne[]>([]);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chargerMessages();

    const channel = supabase
      .channel(
        `call-messages-${call.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_messages",
          filter: `call_id=eq.${call.id}`,
        },
        (payload) => {
          const nouveauMessage =
            payload.new as MessageInterne;

          setMessages(
            (messagesActuels) => {
              const existe =
                messagesActuels.some(
                  (item) =>
                    item.id ===
                    nouveauMessage.id
                );

              if (existe) {
                return messagesActuels;
              }

              return [
                ...messagesActuels,
                nouveauMessage,
              ];
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [call.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function chargerMessages() {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("call_messages")
        .select("*")
        .eq("call_id", call.id)
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Erreur chargement messages :",
        error
      );

      setLoading(false);
      return;
    }

    setMessages(
      (data as MessageInterne[]) || []
    );

    setLoading(false);
  }

  async function envoyerMessage(
    event?: FormEvent
  ) {
    event?.preventDefault();

    const texte =
      message.trim();

    if (!texte || sending) {
      return;
    }

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert(
          "Utilisateur non connecté."
        );
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "role, technician_name, email"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Erreur profil messagerie :",
          profileError
        );
      }

      const role =
        profile?.role ||
        "technicien";

      const authorName =
        profile?.technician_name ||
        user.user_metadata
          ?.full_name ||
        profile?.email ||
        user.email ||
        "Utilisateur ArtiCall AI";

      const { error } =
        await supabase
          .from("call_messages")
          .insert({
            call_id: call.id,
            user_id: user.id,
            author_name:
              authorName,
            author_role: role,
            message: texte,
          });

      if (error) {
        throw error;
      }

      setMessage("");
    } catch (error) {
      console.error(
        "Erreur envoi message :",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Impossible d'envoyer le message."
      );
    } finally {
      setSending(false);
    }
  }

  function nomRole(
    role: string | null
  ) {
    if (role === "admin") {
      return "👑 Responsable";
    }

    if (
      role === "technicien"
    ) {
      return "👷 Technicien";
    }

    return "👤 Utilisateur";
  }

  function formaterDate(
    date: string
  ) {
    return new Date(
      date
    ).toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            💬 Messagerie interne
          </h3>

          <p
            style={{
              margin:
                "5px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Échanges entre le responsable
            et le technicien.
          </p>
        </div>

        <span
          style={{
            padding: "6px 9px",
            borderRadius:
              "999px",
            background:
              "#f1f5f9",
            color: "#475569",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {messages.length}{" "}
          message
          {messages.length > 1
            ? "s"
            : ""}
        </span>
      </div>

      <div
        style={{
          maxHeight: "420px",
          overflowY: "auto",
          padding: "10px",
          borderRadius: "14px",
          border:
            "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        {loading ? (
          <p
            style={{
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Chargement des messages...
          </p>
        ) : messages.length === 0 ? (
          <div
            style={{
              padding: "30px 15px",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <div
              style={{
                fontSize: "28px",
              }}
            >
              💬
            </div>

            <p>
              Aucun message pour cette
              intervention.
            </p>
          </div>
        ) : (
          messages.map(
            (item) => (
              <div
                key={item.id}
                style={{
                  marginBottom:
                    "12px",
                  padding:
                    "12px 14px",
                  borderRadius:
                    "12px",
                  background:
                    "white",
                  border:
                    "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "12px",
                    flexWrap:
                      "wrap",
                    marginBottom:
                      "8px",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        color:
                          "#0f172a",
                      }}
                    >
                      {item.author_name ||
                        "Utilisateur"}
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "3px",
                        color:
                          item.author_role ===
                          "admin"
                            ? "#2563eb"
                            : "#16a34a",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                      }}
                    >
                      {nomRole(
                        item.author_role
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      color:
                        "#94a3b8",
                      fontSize:
                        "12px",
                    }}
                  >
                    {formaterDate(
                      item.created_at
                    )}
                  </span>
                </div>

                <div
                  style={{
                    color:
                      "#334155",
                    lineHeight: 1.5,
                    whiteSpace:
                      "pre-wrap",
                    overflowWrap:
                      "anywhere",
                  }}
                >
                  {item.message}
                </div>
              </div>
            )
          )
        )}

        <div
          ref={messagesEndRef}
        />
      </div>

      <form
        onSubmit={envoyerMessage}
        style={{
          marginTop: "14px",
        }}
      >
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
          placeholder="Écrire un message interne..."
          rows={3}
          style={{
            width: "100%",
            boxSizing:
              "border-box",
            resize: "vertical",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            border:
              "1px solid #cbd5e1",
            outline: "none",
            fontFamily:
              "inherit",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
            marginTop: "10px",
          }}
        >
          <button
            type="submit"
            disabled={
              sending ||
              !message.trim()
            }
            style={{
              minWidth: "130px",
              padding:
                "11px 16px",
              borderRadius:
                "10px",
              border: "none",
              background:
                "#2563eb",
              color: "white",
              fontWeight: 800,
              cursor:
                sending
                  ? "not-allowed"
                  : "pointer",
              opacity:
                sending ||
                !message.trim()
                  ? 0.6
                  : 1,
            }}
          >
            {sending
              ? "Envoi..."
              : "➤ Envoyer"}
          </button>
        </div>
      </form>
    </Card>
  );
}