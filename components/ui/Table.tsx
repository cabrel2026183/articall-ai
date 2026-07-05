"use client";

type TableProps = {
  children: React.ReactNode;
};

export default function Table({ children }: TableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
        }}
      >
        {children}
      </table>
    </div>
  );
}