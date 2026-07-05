"use client";

type AvatarProps = {
  name?: string;
  email?: string;
};

export default function Avatar({ name, email }: AvatarProps) {
  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "#2563eb",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "700",
        }}
      >
        {initial}
      </div>

      <div>
        {name && <p style={{ margin: 0, fontWeight: "700" }}>{name}</p>}
        {email && (
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
            {email}
          </p>
        )}
      </div>
    </div>
  );
}