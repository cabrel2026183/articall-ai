import type { Metadata } from "next";
import LegalPage, { type SectionLegale } from "../../components/legal/LegalPage";
import { ENTREPRISE as E } from "../../lib/entreprise";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — ArtiCall AI",
};

const sections: SectionLegale[] = [
  {
    titre: "Objet",
    paragraphes: [
      `Les présentes conditions générales d'utilisation (CGU) définissent les règles d'accès et d'usage de l'application ${E.nomCommercial} (ArtiCall AI), service en ligne destiné aux professionnels pour la gestion des appels et des demandes clients (interventions, devis, factures, planning des techniciens).`,
      "L'utilisation du service implique l'acceptation sans réserve des CGU.",
    ],
  },
  {
    titre: "Accès au service et compte",
    paragraphes: [
      "Le service est réservé aux professionnels. La création d'un compte nécessite une adresse email valide et un mot de passe. L'utilisateur garantit l'exactitude des informations fournies et les tient à jour.",
      "L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. Il doit informer l'éditeur sans délai de toute utilisation non autorisée.",
      "Le compte administrateur peut inviter des techniciens. Ces derniers disposent d'un accès limité à leurs propres interventions, sans accès aux montants ni aux devis et factures.",
    ],
  },
  {
    titre: "Description du service",
    paragraphes: [
      "ArtiCall AI permet notamment d'enregistrer des appels et demandes clients, de qualifier un problème grâce à un questionnaire de diagnostic assisté, de planifier des interventions, d'établir et d'envoyer des devis et factures, et de suivre l'activité.",
      "L'éditeur peut faire évoluer le service, ses fonctionnalités et son interface. Il peut également en suspendre l'accès pour maintenance, sans que cela ouvre droit à indemnité.",
    ],
  },
  {
    titre: "Diagnostic assisté : nature et limites",
    paragraphes: [
      "Les diagnostics, évaluations d'urgence, consignes de sécurité et recommandations de matériel fournis par l'outil sont de simples aides. Ils ne constituent ni un avis technique contraignant ni un conseil professionnel.",
      "L'utilisateur reste seul responsable des interventions réalisées, des consignes données à ses clients et du respect de la réglementation applicable à son métier. En cas de danger (gaz, incendie, électrocution, etc.), il convient de contacter immédiatement les services de secours (18, 15 ou 112).",
    ],
  },
  {
    titre: "Obligations de l'utilisateur",
    paragraphes: [
      "L'utilisateur s'engage à utiliser le service conformément à la loi et aux présentes CGU, et notamment à ne pas : porter atteinte à la sécurité ou au fonctionnement du service, tenter d'accéder aux données d'un autre utilisateur, extraire ou copier massivement le contenu, ou y introduire des contenus illicites.",
      "L'utilisateur est responsable des données qu'il saisit, en particulier des données personnelles de ses propres clients. Il s'engage à informer ses clients du traitement de leurs données conformément à la réglementation.",
      "L'utilisateur est responsable de la conformité de ses devis et factures (mentions obligatoires, numérotation, TVA). L'outil l'assiste mais ne remplace pas l'avis d'un expert-comptable.",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    paragraphes: [
      `${E.nomCommercial}, le logiciel, son interface et ses contenus sont protégés. L'éditeur concède à l'utilisateur un droit d'usage personnel, non exclusif et non transférable, limité à la durée de son abonnement.`,
      "L'utilisateur conserve la propriété de ses données et de ses contenus.",
    ],
  },
  {
    titre: "Disponibilité et responsabilité",
    paragraphes: [
      "L'éditeur met en œuvre des moyens raisonnables pour assurer l'accès continu au service, sans garantir l'absence d'interruption ni d'erreur. Il est tenu d'une obligation de moyens.",
      "Sa responsabilité ne saurait être engagée pour les dommages indirects (perte de chiffre d'affaires, de clientèle ou d'image), ni pour les conséquences d'une mauvaise utilisation du service ou d'une indisponibilité des services tiers (hébergement, paiement, email, téléphonie).",
      "Il appartient à l'utilisateur de conserver une copie des documents importants (notamment ses factures).",
    ],
  },
  {
    titre: "Suspension et résiliation",
    paragraphes: [
      "L'éditeur peut suspendre ou fermer un compte en cas de manquement aux CGU, d'usage frauduleux ou de non-paiement, après mise en demeure restée sans effet, sauf urgence.",
      "L'utilisateur peut résilier son abonnement selon les conditions prévues par les conditions générales de vente.",
    ],
  },
  {
    titre: "Données personnelles",
    paragraphes: [
      "Les modalités de traitement des données sont décrites dans la politique de confidentialité.",
    ],
  },
  {
    titre: "Modification des CGU",
    paragraphes: [
      "Les CGU peuvent être modifiées à tout moment. La version applicable est celle en ligne à la date d'utilisation. En cas de changement important, les utilisateurs en seront informés.",
    ],
  },
  {
    titre: "Droit applicable et contact",
    paragraphes: [
      `Les CGU sont soumises au droit français. Pour toute question : ${E.email}. À défaut d'accord amiable, les tribunaux français sont compétents.`,
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      titre="Conditions générales d'utilisation"
      miseAJour={E.derniereMiseAJour}
      sections={sections}
    />
  );
}