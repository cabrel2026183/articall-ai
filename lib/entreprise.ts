// ============================================================
// INFORMATIONS LÉGALES DE L'ÉDITEUR
// ============================================================
// Source unique pour les pages : mentions légales, CGU, CGV et
// confidentialité. Pour changer une information (adresse après
// domiciliation, téléphone, nom commercial validé...), modifiez
// UNIQUEMENT les valeurs ci-dessous.
// ============================================================

export const ENTREPRISE = {
  nomCommercial: "ArticallAI",
  exploitant: "Cabrel ENGOME SOPPO DISSIOMBI",
  forme: "Entrepreneur individuel",
  rcs: "948 201 199 R.C.S. Melun",
  siren: "948 201 199",
  siret: "948 201 199 00015",
  adresse: "1 Rue de Lieusaint, 77380 Combs-la-Ville, France",
  email: "contact@articallai.com",
  // Numéro de téléphone : à renseigner (exigé par la LCEN pour un
  // professionnel). Laissé vide, il n'est pas affiché.
  telephone: "",
  // Code APE : à renseigner quand il apparaît sur l'avis de situation Sirene.
  codeApe: "",
  siteUrl: "https://app.articallai.com",
  // true = TVA facturée (prix HT + TVA). false = franchise en base de TVA.
  tvaApplicable: false,
  derniereMiseAJour: "23 novembre 2026",
};

export const MENTION_TVA = ENTREPRISE.tvaApplicable
  ? "Les prix sont indiqués hors taxes (HT). La TVA applicable s'ajoute au prix."
  : "TVA non applicable, article 293 B du CGI.";