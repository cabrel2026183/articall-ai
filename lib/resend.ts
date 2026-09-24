// Client Resend partagé pour tout le projet.
//
// Utilise la variable d'environnement RESEND_API_KEY (déjà présente dans
// Vercel). L'adresse d'envoi utilise RESEND_FROM_EMAIL si elle est définie,
// sinon "onboarding@resend.dev" (adresse de test fournie par Resend,
// fonctionne sans domaine vérifié, pratique en attendant que
// articallai.com soit vérifié dans Resend → Domains).

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_EXPEDITEUR =
  process.env.RESEND_FROM_EMAIL || "ArtiCall AI <onboarding@resend.dev>";