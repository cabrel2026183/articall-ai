import type { Metadata } from "next";
import LegalPage, { type SectionLegale } from "../../components/legal/LegalPage";
import { ENTREPRISE as E, MENTION_TVA } from "../../lib/entreprise";
import {
  TARIF_MENSUEL,
  TARIF_INSTALLATION,
  TARIF_ESSAI_JOURS,
} from "../../lib/tarifs";

export const metadata: Metadata = {
  title: "Conditions générales de vente — ArtiCall AI",
};

const sections: SectionLegale[] = [
  {
    titre: "Objet et champ d'application",
    paragraphes: [
      `Les présentes conditions générales de vente (CGV) régissent l'abonnement au service ${E.nomCommercial} (ArtiCall AI) proposé par ${E.exploitant}, ${E.forme.toLowerCase()} (SIRET ${E.siret}), à des clients professionnels.`,
      "Le client déclare agir pour les besoins de son activité professionnelle. La souscription vaut acceptation des CGV et des conditions générales d'utilisation.",
    ],
  },
  {
    titre: "Offre et prix",
    paragraphes: [
      `L'abonnement est de ${TARIF_MENSUEL} € par mois. Des frais d'installation uniques de ${TARIF_INSTALLATION} € s'appliquent à la souscription. Le détail des fonctionnalités incluses est présenté sur la page de tarifs.`,
      MENTION_TVA,
      "L'éditeur peut modifier ses tarifs. Toute modification est notifiée au client avec un préavis raisonnable et ne s'applique qu'à compter de la période suivante ; le client peut résilier avant son entrée en vigueur.",
    ],
  },
  {
    titre: "Période d'essai",
    paragraphes: [
      `Une période d'essai de ${TARIF_ESSAI_JOURS} jours est proposée à la première souscription. À son terme, l'abonnement payant démarre, sauf résiliation avant la fin de l'essai.`,
    ],
  },
  {
    titre: "Paiement",
    paragraphes: [
      "Le paiement s'effectue en ligne par carte bancaire via le prestataire de paiement Stripe. L'abonnement est prélevé automatiquement à chaque échéance mensuelle.",
      "En cas d'échec de paiement, l'éditeur peut suspendre l'accès au service jusqu'à régularisation. Les sommes dues portent intérêt au taux légal. Pour un client professionnel, tout retard de paiement entraîne de plein droit une indemnité forfaitaire de recouvrement de 40 €.",
      "Une facture est mise à disposition du client pour chaque paiement.",
    ],
  },
  {
    titre: "Durée et résiliation",
    paragraphes: [
      "L'abonnement est souscrit pour une durée d'un mois, renouvelée tacitement par périodes mensuelles successives.",
      "Le client peut résilier à tout moment depuis son espace ou par email. La résiliation prend effet à la fin de la période mensuelle en cours ; toute période commencée reste due et n'est pas remboursée. Les frais d'installation ne sont pas remboursables.",
      "Après la résiliation, le client peut demander l'export de ses données pendant un délai raisonnable. Passé ce délai, elles sont supprimées ou anonymisées, sous réserve des obligations légales de conservation.",
    ],
  },
  {
    titre: "Droit de rétractation",
    paragraphes: [
      "Le service étant destiné aux professionnels pour leur activité, le droit de rétractation prévu pour les consommateurs ne s'applique pas. Si le client est un professionnel pouvant en bénéficier au titre du code de la consommation (activité hors de son champ principal, moins de cinq salariés), il peut en faire la demande par email dans les quatorze jours suivant la souscription.",
    ],
  },
  {
    titre: "Obligations de l'éditeur",
    paragraphes: [
      "L'éditeur fournit le service avec diligence et assure un support par email. Il est tenu d'une obligation de moyens quant à la disponibilité du service, qui peut être interrompu pour maintenance ou en cas de défaillance d'un prestataire tiers.",
    ],
  },
  {
    titre: "Responsabilité",
    paragraphes: [
      "La responsabilité de l'éditeur est limitée aux dommages directs et prévisibles, dans la limite des sommes versées par le client au cours des douze derniers mois. Elle exclut les dommages indirects (perte d'exploitation, de clientèle, de données non sauvegardées par le client).",
      "Les diagnostics et recommandations de l'outil sont des aides à la décision : le client reste responsable de ses interventions et de la conformité de ses documents commerciaux.",
      "Ces limitations ne s'appliquent pas en cas de faute lourde ou dolosive, ni dans les cas où la loi l'interdit.",
    ],
  },
  {
    titre: "Données personnelles",
    paragraphes: [
      "Pour les données de ses propres clients saisies dans l'outil, le client est responsable du traitement et l'éditeur agit en qualité de sous-traitant. Les engagements correspondants sont décrits dans la politique de confidentialité.",
    ],
  },
  {
    titre: "Force majeure",
    paragraphes: [
      "Aucune des parties n'est responsable d'un manquement dû à un cas de force majeure au sens de l'article 1218 du code civil, notamment une panne générale des réseaux ou des prestataires d'hébergement.",
    ],
  },
  {
    titre: "Médiation, droit applicable et litiges",
    paragraphes: [
      `Les CGV sont soumises au droit français. En cas de difficulté, le client contacte d'abord l'éditeur à ${E.email} afin de rechercher une solution amiable. À défaut, les tribunaux français sont compétents.`,
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      titre="Conditions générales de vente"
      miseAJour={E.derniereMiseAJour}
      sections={sections}
    />
  );
}