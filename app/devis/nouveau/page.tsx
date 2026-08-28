"use client";
import {
  FormEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { supabase } from "../../../lib/supabase";
import type { Call } from "../../../lib/types";

type QuoteItem = {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
};

const ligneInitiale: QuoteItem = {
  description: "",
  quantity: 1,
  unit_price: 0,
  vat_rate: 20,
};

function NouveauDevisContent() {
  const router = useRouter();
const searchParams = useSearchParams();
const callId = searchParams.get("callId");

  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function verifierAcces() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const email = user.email?.toLowerCase().trim();

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      const role = profile?.role || "technicien";

      if (role !== "admin") {
        window.location.href = "/";
        return;
      }

      setCheckingAccess(false);
    }

    verifierAcces();
  }, []);


const [loadingIntervention, setLoadingIntervention] =
  useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const [discount, setDiscount] = useState(0);

  const [items, setItems] = useState<QuoteItem[]>([
    { ...ligneInitiale },
  ]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  async function chargerIntervention() {
    if (!callId) return;

    setLoadingIntervention(true);
    setMessage("");

    const { data, error } = await supabase
      .from("calls")
      .select("*")
      .eq("id", callId)
      .maybeSingle<Call>();

    if (error) {
      console.error(
        "Erreur chargement intervention :",
        error
      );

      setMessage(
        `Impossible de charger l’intervention : ${error.message}`
      );

      setLoadingIntervention(false);
      return;
    }

    if (!data) {
      setMessage("Intervention introuvable.");
      setLoadingIntervention(false);
      return;
    }

    setClientName(data.client_name || "");
    setClientPhone(data.client_phone || "");
    setClientEmail(data.client_email || "");
    setAddress(data.address || "");

    setItems([
      {
        description:
          data.problem ||
          data.summary ||
          "Intervention",
        quantity: 1,
        unit_price: Number(data.amount || 0),
        vat_rate: 20,
      },
    ]);

    setNotes(
      data.internal_notes ||
        `Devis créé depuis l’intervention ${
          data.id
        }.`
    );

    setLoadingIntervention(false);
  }

  chargerIntervention();
}, [callId]);

  const sousTotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + item.quantity * item.unit_price;
    }, 0);
  }, [items]);

  const montantRemise = useMemo(() => {
    return Math.min(
      sousTotal,
      Math.max(0, discount)
    );
  }, [sousTotal, discount]);

  const baseApresRemise = sousTotal - montantRemise;

  const montantTva = useMemo(() => {
    if (sousTotal <= 0) {
      return 0;
    }

    return items.reduce((total, item) => {
      const totalLigne =
        item.quantity * item.unit_price;

      const partRemise =
        totalLigne / sousTotal;

      const remiseLigne =
        montantRemise * partRemise;

      const baseLigne =
        totalLigne - remiseLigne;

      return total + baseLigne * (item.vat_rate / 100);
    }, 0);
  }, [items, sousTotal, montantRemise]);

  const totalTtc = baseApresRemise + montantTva;

  function modifierLigne(
    index: number,
    champ: keyof QuoteItem,
    valeur: string
  ) {
    setItems((anciennesLignes) =>
      anciennesLignes.map((item, position) => {
        if (position !== index) {
          return item;
        }

        if (champ === "description") {
          return {
            ...item,
            description: valeur,
          };
        }

        return {
          ...item,
          [champ]: Number(valeur),
        };
      })
    );
  }

  function ajouterLigne() {
    setItems((anciennesLignes) => [
      ...anciennesLignes,
      { ...ligneInitiale },
    ]);
  }

  function supprimerLigne(index: number) {
    setItems((anciennesLignes) => {
      if (anciennesLignes.length === 1) {
        return anciennesLignes;
      }

      return anciennesLignes.filter(
        (_, position) => position !== index
      );
    });
  }

  async function enregistrerDevis(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (!callId) {
  setMessage(
    "ERREUR : aucun identifiant d’intervention n’a été reçu."
  );
  return;
}

    if (!clientName.trim()) {
      setMessage("Le nom du client est obligatoire.");
      return;
    }

    const lignesValides = items.filter(
      (item) =>
        item.description.trim() &&
        item.quantity > 0
    );

    if (lignesValides.length === 0) {
      setMessage(
        "Ajoute au moins une ligne valide au devis."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const numeroDevis = `DEV-${new Date().getFullYear()}-${Date.now()
        .toString()
        .slice(-6)}`;

      const tauxTvaMoyen =
        baseApresRemise > 0
          ? (montantTva / baseApresRemise) * 100
          : 0;

      const { data: devis, error: erreurDevis } =
        await supabase
          .from("quotes")
          .insert({
            call_id: callId,
            quote_number: numeroDevis,
            client_name: clientName.trim(),
            client_phone: clientPhone.trim() || null,
            client_email: clientEmail.trim() || null,
            address: address.trim() || null,
            status: "draft",
            subtotal: sousTotal,
            discount: montantRemise,
            vat_rate: tauxTvaMoyen,
            vat_amount: montantTva,
            total: totalTtc,
            notes: notes.trim() || null,
            valid_until: validUntil || null,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (erreurDevis) {
        throw erreurDevis;
      }


      const lignesAEnregistrer = lignesValides.map(
        (item, index) => {
          const totalLigne =
            item.quantity * item.unit_price;

          const partRemise =
            sousTotal > 0
              ? totalLigne / sousTotal
              : 0;

          const remiseLigne =
            montantRemise * partRemise;

          const baseLigne =
            totalLigne - remiseLigne;

          const tvaLigne =
            baseLigne * (item.vat_rate / 100);

          return {
            quote_id: devis.id,
            description: item.description.trim(),
            quantity: item.quantity,
            unit_price: item.unit_price,
            vat_rate: item.vat_rate,
            line_subtotal: totalLigne,
            vat_amount: tvaLigne,
            line_total: baseLigne + tvaLigne,
            position: index,
            updated_at: new Date().toISOString(),
          };
        }
      );

      const { error: erreurLignes } = await supabase
        .from("quote_items")
        .insert(lignesAEnregistrer);

      if (erreurLignes) {
        await supabase
          .from("quotes")
          .delete()
          .eq("id", devis.id);

        throw erreurLignes;
      }

      setMessage("Le devis a été enregistré.");

      router.push("/devis");
    } catch (error) {
      console.error("Erreur création devis :", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer le devis."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAccess) {
    return (
      <main className="mx-auto max-w-6xl p-6">
        Chargement...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Nouveau devis
        </h1>

        <p className="mt-2 text-gray-600">
          Renseigne le client et les prestations à facturer.
        </p>
        {loadingIntervention && (
  <p className="mt-3 rounded-lg bg-blue-50 p-3 text-blue-700">
    Importation des informations du client...
  </p>
)}

{callId && !loadingIntervention && (
  <p className="mt-3 rounded-lg bg-green-50 p-3 text-green-700">
    Informations importées depuis l’intervention.
  </p>
)}
      </div>

      <form
        onSubmit={enregistrerDevis}
        className="space-y-8"
      >
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Client
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium">
                Nom du client
              </label>

              <input
                type="text"
                value={clientName}
                onChange={(event) =>
                  setClientName(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Nom ou entreprise"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Téléphone
              </label>

              <input
                type="tel"
                value={clientPhone}
                onChange={(event) =>
                  setClientPhone(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
                placeholder="06 00 00 00 00"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                E-mail
              </label>

              <input
                type="email"
                value={clientEmail}
                onChange={(event) =>
                  setClientEmail(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
                placeholder="client@email.fr"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Date de validité
              </label>

              <input
                type="date"
                value={validUntil}
                onChange={(event) =>
                  setValidUntil(event.target.value)
                }
                className="w-full rounded-lg border px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-medium">
              Adresse
            </label>

            <textarea
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              className="min-h-24 w-full rounded-lg border px-4 py-3"
              placeholder="Adresse complète du client"
            />
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              Prestations
            </h2>

            <button
              type="button"
              onClick={ajouterLigne}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
            >
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[2fr_110px_140px_110px_auto]"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(event) =>
                      modifierLigne(
                        index,
                        "description",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Main-d’œuvre, déplacement..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Quantité
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(event) =>
                      modifierLigne(
                        index,
                        "quantity",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Prix unitaire HT
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(event) =>
                      modifierLigne(
                        index,
                        "unit_price",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    TVA %
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={item.vat_rate}
                    onChange={(event) =>
                      modifierLigne(
                        index,
                        "vat_rate",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => supprimerLigne(index)}
                    disabled={items.length === 1}
                    className="rounded-lg border border-red-300 px-3 py-2 text-red-700 disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <label className="mb-2 block font-medium">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              className="min-h-36 w-full rounded-lg border px-4 py-3"
              placeholder="Conditions, détails complémentaires..."
            />
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold">
              Totaux
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total HT</span>
                <strong>
                  {sousTotal.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </strong>
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Remise en €
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(event) =>
                    setDiscount(
                      Number(event.target.value)
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="flex justify-between">
                <span>TVA</span>
                <strong>
                  {montantTva.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </strong>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span>Total TTC</span>
                  <strong>
                    {totalTtc.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-lg bg-gray-100 p-4">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Enregistrement..."
              : "Enregistrer le devis"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg border px-6 py-3 font-semibold"
          >
            Annuler
          </button>
        </div>
      </form>
    </main>
  );
}

export default function NouveauDevisPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl p-6">
          Chargement du devis...
        </main>
      }
    >
      <NouveauDevisContent />
    </Suspense>
  );
}