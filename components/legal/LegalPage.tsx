import Link from "next/link";

export type SectionLegale = {
  titre: string;
  paragraphes: string[];
};

const LIENS = [
  { href: "/mentions-legales", libelle: "Mentions légales" },
  { href: "/cgu", libelle: "CGU" },
  { href: "/cgv", libelle: "CGV" },
  { href: "/confidentialite", libelle: "Confidentialité" },
];

export default function LegalPage({
  titre,
  miseAJour,
  introduction,
  sections,
}: {
  titre: string;
  miseAJour: string;
  introduction?: string;
  sections: SectionLegale[];
}) {
  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "32px 20px 64px",
        lineHeight: 1.65,
        fontSize: 15,
      }}
    >
      <Link
        href="/"
        style={{ fontSize: 14, textDecoration: "none", opacity: 0.7 }}
      >
        ← Retour à ArtiCall AI
      </Link>

      <h1 style={{ fontSize: 30, margin: "20px 0 4px" }}>{titre}</h1>
      <p style={{ fontSize: 13, opacity: 0.65, margin: "0 0 24px" }}>
        Dernière mise à jour : {miseAJour}
      </p>

      {introduction && <p style={{ marginBottom: 24 }}>{introduction}</p>}

      {sections.map((section, i) => (
        <section key={section.titre} style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>
            {i + 1}. {section.titre}
          </h2>
          {section.paragraphes.map((p, j) => (
            <p key={j} style={{ margin: "0 0 10px" }}>
              {p}
            </p>
          ))}
        </section>
      ))}

      <nav
        style={{
          marginTop: 40,
          paddingTop: 16,
          borderTop: "1px solid rgba(128,128,128,0.35)",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 14,
        }}
      >
        {LIENS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.libelle}
          </Link>
        ))}
      </nav>
    </main>
  );
}