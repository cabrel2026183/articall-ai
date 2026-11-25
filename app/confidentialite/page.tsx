import type { Metadata } from "next";
import LegalPage, { type SectionLegale } from "../../components/legal/LegalPage";
import { ENTREPRISE as E } from "../../lib/entreprise";

export const metadata: Metadata = {
  title: "Politique de confidentialité — ArtiCall AI",
};

const sections: SectionLegale[] = [
  {
    titre: "Qui est responsable de vos données",
    paragraphes: [
      `${E.exploitant}, ${E.forme.toLowerCase()} exerçant sous le nom commercial ${E.nomCommercial} (SIRET ${E.siret}, ${E.adresse}), est responsable du traitement des données de comptes des utilisateurs. Contact : ${E.email}.`,
      "Pour les données de leurs propres clients saisies dans l'application, vos clients artisans sont responsables de traitement et ArtiCall AI intervient comme sous-traitant, uniquement sur leurs instructions.",
    ],
  },
  {
    titre: "Données collectées",
    paragraphes: [
      "Données de compte : nom, adresse email, mot de passe (stocké sous forme chiffrée par le service d'authentification), rôle, entreprise, métier, compétences et disponibilités des techniciens.",
      "Données saisies par l'utilisateur sur ses clients et interventions : nom, téléphone, email, adresse, description du problème, notes, photos, signatures, devis, factures et montants.",
      "Données de paiement : traitées par Stripe. ArtiCall AI ne reçoit ni ne conserve les numéros de carte bancaire.",
      "Données techniques : journaux de connexion et de sécurité nécessaires au fonctionnement du service.",
    ],
  },
  {
    titre: "Finalités et bases légales",
    paragraphes: [
      "Fournir le service et gérer le compte (exécution du contrat).",
      "Gérer l'abonnement, la facturation et les obligations comptables (contrat et obligation légale).",
      "Envoyer les emails liés au service : bienvenue, devis, factures, confirmations de rendez-vous, notifications d'urgence (exécution du contrat).",
      "Assurer la sécurité, prévenir les abus et améliorer le service (intérêt légitime).",
      "Les données ne sont ni vendues ni utilisées à des fins publicitaires.",
    ],
  },
  {
    titre: "Destinataires et sous-traitants",
    paragraphes: [
      "Les données sont accessibles à l'éditeur et aux prestataires techniques strictement nécessaires : Vercel (hébergement de l'application), Supabase (base de données et authentification), Stripe (paiement), Resend (envoi d'emails), Twilio (téléphonie et SMS, lorsque ces fonctions sont activées).",
      "Au sein d'une entreprise cliente, l'accès est limité par rôle : les techniciens ne voient que leurs propres interventions, sans montants ni documents financiers.",
    ],
  },
  {
    titre: "Transferts hors de l'Union européenne",
    paragraphes: [
      "Certains prestataires sont établis aux États-Unis ou peuvent y traiter des données. Ces transferts sont encadrés par des garanties appropriées (cadre de protection des données UE-États-Unis ou clauses contractuelles types) proposées par ces prestataires.",
    ],
  },
  {
    titre: "Durées de conservation",
    paragraphes: [
      "Les données du compte et des interventions sont conservées pendant la durée de l'abonnement, puis supprimées ou anonymisées dans un délai raisonnable après sa fin, sur demande ou à l'issue de ce délai.",
      "Les données de facturation de l'éditeur sont conservées pendant la durée légale applicable (dix ans pour les pièces comptables).",
    ],
  },
  {
    titre: "Vos droits",
    paragraphes: [
      `Vous disposez des droits d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité. Pour les exercer : ${E.email}. Une pièce d'identité pourra être demandée en cas de doute.`,
      "Si vous êtes le client final d'un artisan, adressez d'abord votre demande à cet artisan, responsable du traitement ; nous l'aiderons à y répondre.",
      "Vous pouvez introduire une réclamation auprès de la CNIL (cnil.fr).",
    ],
  },
  {
    titre: "Sécurité",
    paragraphes: [
      "Les échanges sont chiffrés (HTTPS). L'accès aux données est cloisonné par entreprise et par rôle au niveau de la base de données. Aucun système n'étant infaillible, l'éditeur notifiera les personnes et l'autorité compétente en cas de violation de données lorsque la loi l'exige.",
    ],
  },
  {
    titre: "Cookies",
    paragraphes: [
      "Le service utilise uniquement les cookies et stockages techniques nécessaires à la connexion et au fonctionnement (session d'authentification). Il n'utilise pas de cookies publicitaires ou de mesure d'audience nécessitant un consentement.",
    ],
  },
  {
    titre: "Modification de la politique",
    paragraphes: [
      "Cette politique peut être mise à jour. La date de dernière mise à jour figure en haut de la page.",
    ],
  },
];

export default function Page() {
  return (
    <LegalPage
      titre="Politique de confidentialité"
      miseAJour={E.derniereMiseAJour}
      sections={sections}
    />
  );
}