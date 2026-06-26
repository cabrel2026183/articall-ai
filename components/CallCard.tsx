"use client";

type CallCardProps = {
  call: any;
};

export default function CallCard({ call }: CallCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "10px",
        marginTop: "10px",
        borderRadius: "8px",
      }}
    >
      <strong>{call.client_name}</strong>

      <p>{call.client_phone}</p>

      <p>{call.problem}</p>
    </div>
  );
}