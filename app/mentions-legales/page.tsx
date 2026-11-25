import type { Metadata } from "next";
import LegalPage, { type SectionLegale } from "../../components/legal/LegalPage";
import { ENTREPRISE as E } from "../../lib/entreprise";

export const metadata: Metadata = {
  title: "Mentions légales — ArtiCall AI",
};

const sections: SectionLegale[] = [
  {
    titre: "Éditeur du site",
    paragraphes: [
      `Le site et l'application ${E.nomCommercial} (ArtiCall AI), accessibles à l'adresse ${E.siteUrl}, sont édités par ${E.exploitant}, ${E.forme.toLowerCase()}, exerçant sous le nom commercial ${E.nomCommercial}.`,
      `Immatriculation : ${E.rcs}. SIREN : ${E.siren}. SIRET : ${E.siret}.${E.codeApe ? ` Code APE : ${E.codeApe}.` : ""}`,
      `Adresse : ${E.adresse}.`,
      `Contact : ${E.email}${E.telephone ? ` — Téléphone : ${E.telephone}` : ""}.`,
      "TVA : voir les conditions générales de vente.",
    ],
  },
  {
    titre: "Directeur de la publication",
    paragraphes: [`${E.exploitant}, en qualité d'éditeur.`],
  },
  {
    titre: "Hébergement",
    paragraphes: [
      "L'application est hébergée par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).",
      "Les données sont stockées via Supabase (supabase.com), qui assure la base de données et l'authentification.",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    paragraphes: [
      `Les textes, interfaces, logos, marques, logiciels et bases de données de ${E.nomCommercial} sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation ou extraction non autorisée, totale ou partielle, est interdite.`,
      "Les données saisies par les utilisateurs (clients, interventions, devis, factures, photos) restent la propriété de ces derniers.",
    ],
  },
  {
    titre: "Données personnelles",
    paragraphes: [
      "Le traitement des données personnelles est décrit dans la politique de confidentialité, accessible depuis le pied de page de ce site.",
    ],
  },
  {
    titre: "Responsabilité",
    paragraphes: [
      "L'éditeur s'efforce d'assurer l'exactitude des informations publiées et la disponibilité du service, sans garantie d'absence d'erreur ou d'interruption. Les diagnostics et recommandations produits par l'outil sont une aide à la décision : ils ne remplacent pas le jugement d'un professionnel qualifié.",
    ],
  },
  {
    titre: "Droit applicable",
    paragraphes: [
      "Le présent site est soumis au droit français. En cas de litige, et à défaut de solution amiable, les tribunaux français sont compétents.",
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      titre="Mentions légales"
      miseAJour={E.derniereMiseAJour}
      sections={sections}
    />
  );
}