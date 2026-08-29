// Types centraux du projet ArtiCall AI.
// Importer depuis "../lib/types" (ou chemin relatif équivalent selon
// la profondeur du fichier) plutôt que d'utiliser `any`.
//
// Tous les types ci-dessous sont alignés sur la structure réelle des
// tables Supabase (vérifié via information_schema.columns le 24-27/08/2026).

export type CallStatus =
  | "nouveau"
  | "rappelé"
  | "planifie"
  | "scheduled"
  | "en_route"
  | "arrived"
  | "in_progress"
  | "termine"
  | "terminé"
  | "completed";

export type Urgency = "normal" | "important" | "urgent";

export type PaymentStatus = "non_paye" | "paye" | "partiel";

export type Call = {
  id: string;
  user_id: string | null;
  company_id: string | null;
  quote_id: string | null;

  // Client
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;

  // Adresse
  address: string | null;
  street_number: string | null;
  street_name: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  property_type: string | null;
  property_type_other: string | null;
  client_latitude: number | null;
  client_longitude: number | null;

  // Intervention
  problem: string | null;
  summary: string | null;
  urgency: Urgency | null;
  status: CallStatus | null;
  technician: string | null;
  required_skill: string | null;
  recommended_materials: string[] | null;
  workflow_summary: string | null;
  intervention_date: string | null;
  intervention_number: string | null;
  intervention_report: string | null;

  // Notes internes (équipe)
  internal_notes: string | null;
  last_note_update: string | null;
  last_note_author: string | null;

  // Photos / signature
  photo_url: string | null;
  photo_before_url: string | null;
  photo_after_url: string | null;
  signature_url: string | null;
  signature_date: string | null;

  // Paiement / facturation (ancien système, encore utilisé tant que
  // toutes les pages ne sont pas migrées vers invoices/invoice_items)
  amount: number | null;
  payment_status: PaymentStatus | null;
  invoice_number: string | null;
  invoice_date: string | null;

  // Horodatage du parcours
  created_at: string;
  en_route_at: string | null;
  arrived_at: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export type Technician = {
  id: string;
  company_id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  skills: string[] | null;
  active: boolean;
  availability_status: "available" | "busy" | "offline" | "absent";
  created_at: string;
  updated_at: string;
};

export type ProfileRole = "admin" | "technicien";

export type Profile = {
  id: string;
  user_id: string;
  company_id: string | null;
  email: string | null;
  role: ProfileRole | null;
  technician_name: string | null;
  created_at: string;
};

// Sous-ensemble de l'objet User renvoyé par supabase.auth.getUser(),
// limité aux champs réellement utilisés dans l'interface (Sidebar,
// TopBar, MainLayout...).
export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
};

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "refused"
  | "expired";

// IMPORTANT : les colonnes client_* sont les vraies colonnes utilisées
// par toute l'application (création, liste, fiche détail). Les colonnes
// customer_*/tax_rate/discount_amount/total_amount existent aussi dans
// la table mais ne doivent PAS être utilisées : elles sont un doublon
// jamais synchronisé, laissé par une ancienne itération du code.
export type Quote = {
  id: string;
  call_id: string | null;
  company_id: string | null;
  quote_number: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  address: string | null;
  status: QuoteStatus | null;
  subtotal: number | null;
  discount: number | null;
  vat_rate: number | null;
  vat_amount: number | null;
  total: number | null;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteItem = {
  id?: string;
  quote_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate?: number;
  line_subtotal?: number;
  vat_amount?: number;
  line_total?: number;
  position?: number;
};

// IMPORTANT : contrairement à `quotes`, la table `invoices` n'a qu'une
// seule convention de nommage (pas de colonnes fantômes), mais elle est
// DIFFÉRENTE de celle de `quotes` : customer_* (pas client_*),
// tax_rate/tax_amount (pas vat_rate/vat_amount), total_amount (pas total).
// Ne pas confondre les deux tables en copiant-collant du code entre elles.
//
// `status` réutilise les mêmes valeurs que Call.payment_status
// ("non_paye" | "paye" | "partiel") pour rester cohérent avec le reste
// de l'application.
export type Invoice = {
  id: string;
  quote_id: string | null;
  invoice_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  total_amount: number | null;
  status: PaymentStatus | null;
  created_at: string;
  due_date: string | null;
  paid_at: string | null;
  company_id: string | null;
};

export type InvoiceItem = {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate?: number;
  line_subtotal?: number;
  vat_amount?: number;
  line_total?: number;
  position?: number;
};

export type Trade =
  | "plomberie"
  | "electricien"
  | "serrurier"
  | "chauffagiste";

export type CompanySettings = {
  id?: string;
  company_name: string;
  logo_url: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  siret: string;
  tva_number: string;
  primary_color: string;
  trade: Trade;
};