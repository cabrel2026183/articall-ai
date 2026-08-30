"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Profile, ProfileRole } from "../../../lib/types";

export default function UtilisateursSettingsPage() {
  const [utilisateurs, setUtilisateurs] = useState<Profile[]>([]);
  const [monUserId, setMonUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");
  const [enregistrementId, setEnregistrementId] = useState<
    string | null
  >(null);

  useEffect(() => {
    verifierAccesEtCharger();
  }, []);

  async function verifierAccesEtCharger() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const email = user.email?.toLowerCase().trim();

    const { data: profil } = await supabase
      .from("profiles")
      .select("role, company_id, user_id")
      .eq("email", email)
      .maybeSingle();

    const role = profil?.role || "technicien";

    if (role !== "admin") {
      window.location.href = "/";
      return;
    }

    setMonUserId(profil?.user_id || "");

    await chargerUtilisateurs(profil?.company_id || null);
  }

  async function chargerUtilisateurs(
    companyId: string | null
  ) {
    setLoading(true);
    setErreur("");

    if (!companyId) {
      setErreur("Entreprise introuvable.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(
        "Erreur chargement utilisateurs :",
        error
      );
      setErreur(error.message);
      setLoading(false);
      return;
    }

    setUtilisateurs((data as Profile[]) || []);
    setLoading(false);
  }

  async function changerRole(
    utilisateur: Profile,
    nouveauRole: ProfileRole
  ) {
    if (utilisateur.user_id === monUserId) {
      setErreur(
        "Vous ne pouvez pas modifier votre propre rôle."
      );
      return;
    }

    setEnregistrementId(utilisateur.id);
    setErreur("");
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ role: nouveauRole })
      .eq("id", utilisateur.id);

    if (error) {
      console.error(
        "Erreur changement de rôle :",
        error
      );
      setErreur(error.message);
      setEnregistrementId(null);
      return;
    }

    setUtilisateurs((current) =>
      current.map((item) =>
        item.id === utilisateur.id
          ? { ...item, role: nouveauRole }
          : item
      )
    );

    setMessage(
      `Le rôle de ${utilisateur.email} a été mis à jour.`
    );
    setEnregistrementId(null);
  }

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  }

  if (loading) {
    return (
      <main className="p-6">
        <p>Chargement des utilisateurs...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          👥 Utilisateurs
        </h1>

        <p className="mt-2 text-gray-600">
          Gérez les administrateurs et techniciens de votre
          entreprise.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {erreur}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="p-4 font-medium">E-mail</th>
              <th className="p-4 font-medium">
                Nom technicien
              </th>
              <th className="p-4 font-medium">
                Ajouté le
              </th>
              <th className="p-4 font-medium">Rôle</th>
            </tr>
          </thead>

          <tbody>
            {utilisateurs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-gray-500"
                >
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              utilisateurs.map((utilisateur) => {
                const estMoi =
                  utilisateur.user_id === monUserId;

                return (
                  <tr
                    key={utilisateur.id}
                    className="border-b last:border-b-0"
                  >
                    <td className="p-4">
                      {utilisateur.email || "-"}
                      {estMoi && (
                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          Vous
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {utilisateur.technician_name || "-"}
                    </td>

                    <td className="p-4">
                      {formatDate(utilisateur.created_at)}
                    </td>

                    <td className="p-4">
                      <select
                        value={utilisateur.role || "technicien"}
                        disabled={
                          estMoi ||
                          enregistrementId === utilisateur.id
                        }
                        onChange={(event) =>
                          changerRole(
                            utilisateur,
                            event.target.value as ProfileRole
                          )
                        }
                        className="rounded-lg border px-3 py-2 disabled:opacity-50"
                      >
                        <option value="admin">
                          👑 Administrateur
                        </option>
                        <option value="technicien">
                          👷 Technicien
                        </option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-6 text-center text-gray-500">
        L'invitation de nouveaux utilisateurs par e-mail arrive
        prochainement.
      </div>
    </main>
  );
}