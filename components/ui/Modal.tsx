"use client";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(600px, 92vw)",
          background: "white",
          borderRadius: "18px",
          padding: "24px",
          boxShadow: "0 25px 60px rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ marginTop: "20px" }}>{children}</div>
      </div>
    </div>
  );
}