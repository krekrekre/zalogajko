"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAnimalAvatarForUser } from "@/lib/avatars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/app/profil/actions";
import type { Profile } from "@/lib/profile";
import { Camera } from "lucide-react";

const AVATAR_BUCKET = "avatars";

function isoToDisplay(iso: string | null | undefined): string {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!d || !m || !y) return "";
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string {
  const digits = display.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return "";
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "";
  return `${y}-${m}-${d}`;
}

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

interface ProfileFormProps {
  userId: string;
  profile: Profile;
  userEmail: string;
}

export function ProfileForm({ userId, profile, userEmail }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [dateDisplay, setDateDisplay] = useState(isoToDisplay(profile.date_of_birth ?? undefined));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const displayAvatar = avatarUrl || getAnimalAvatarForUser(userId);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const path = `${userId}/avatar.${safeExt}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (uploadError) {
        setMessage({ type: "error", text: `Slika nije učitana: ${uploadError.message}` });
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const url = urlData.publicUrl;
      setAvatarUrl(url);
      // Persist to profile
      const formData = new FormData();
      formData.set("avatar_url", url);
      formData.set("author_name", profile.author_name ?? "");
      formData.set("first_name", profile.first_name ?? "");
      formData.set("last_name", profile.last_name ?? "");
      formData.set("date_of_birth", displayToIso(dateDisplay) || (profile.date_of_birth ?? ""));
      formData.set("country", profile.country ?? "");
      formData.set("location", profile.location ?? "");
      formData.set("about_me", profile.about_me ?? "");
      await updateProfileAction({ error: null }, formData);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "Greška pri učitavanju slike." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("avatar_url", avatarUrl || "");
    formData.set("date_of_birth", displayToIso(dateDisplay) || "");
    const result = await updateProfileAction({ error: null }, formData);
    setSaving(false);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    setMessage({ type: "success", text: "Profil je sačuvan." });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          role="alert"
          className={`rounded-none border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative group">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--ar-gray-200)] bg-[var(--ar-gray-100)]">
            <Image
              src={displayAvatar}
              alt="Profilna slika"
              fill
              className="object-cover"
              sizes="112px"
              unoptimized={displayAvatar.startsWith("data:")}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[var(--color-orange)] text-white shadow hover:bg-[var(--ar-primary-hover)] disabled:opacity-50"
            aria-label="Promeni profilnu sliku"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-[var(--ar-gray-600)]">
          <p className="font-medium text-[var(--ar-gray-900)]">Profilna slika</p>
          <p className="mt-1">
            Kliknite na ikonu kamere da postavite sliku. Podrazumevano se prikazuje životinja.
          </p>
          {uploading && <p className="mt-1 text-[var(--color-orange)]">Učitavanje...</p>}
        </div>
      </div>

      <div>
        <label htmlFor="author_name" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Autorsko ime
        </label>
        <Input
          id="author_name"
          name="author_name"
          type="text"
          defaultValue={profile.author_name ?? ""}
          placeholder="npr. Ana Jovanović"
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-300)] bg-white focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/20"
        />
        <p className="mt-1 text-xs text-[var(--ar-gray-500)]">
          Prikazuje se uz recepte i komentare. Ako ga promenite, menja se i na starim receptima i komentarima.
        </p>
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Ime (samo na profilu)
        </label>
        <Input
          id="first_name"
          name="first_name"
          type="text"
          defaultValue={profile.first_name ?? ""}
          placeholder="Ime"
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-300)] bg-white focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/20"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Prezime (samo na profilu)
        </label>
        <Input
          id="last_name"
          name="last_name"
          type="text"
          defaultValue={profile.last_name ?? ""}
          placeholder="Prezime"
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-300)] bg-white focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/20"
        />
      </div>

      <div>
        <label htmlFor="email_display" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Email (samo prikaz)
        </label>
        <Input
          id="email_display"
          type="text"
          value={userEmail}
          readOnly
          disabled
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-200)] bg-[var(--ar-gray-50)] text-[var(--ar-gray-600)]"
        />
      </div>

      <div>
        <label htmlFor="date_of_birth_display" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Datum rođenja
        </label>
        <input
          type="hidden"
          name="date_of_birth"
          value={displayToIso(dateDisplay)}
          readOnly
        />
        <input
          id="date_of_birth_display"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd/mm/gggg"
          maxLength={10}
          value={dateDisplay}
          onChange={(e) => setDateDisplay(formatDateInput(e.target.value))}
          aria-describedby="date_of_birth_hint"
          className="mt-1 block w-full max-w-[12rem] rounded-none border border-[var(--ar-gray-300)] bg-white px-3 py-2.5 text-[15px] text-[var(--ar-gray-900)] outline-none transition-colors placeholder:text-[var(--ar-gray-400)] focus:border-[var(--color-orange)] focus:ring-2 focus:ring-[var(--color-orange)]/20"
        />
        <p id="date_of_birth_hint" className="mt-1 text-xs text-[var(--ar-gray-500)]">
          Opciono. Unesite datum u formatu dd/mm/gggg.
        </p>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Država
        </label>
        <Input
          id="country"
          name="country"
          type="text"
          defaultValue={profile.country ?? ""}
          placeholder="npr. Srbija"
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-300)] bg-white focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/20"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          Lokacija / Grad
        </label>
        <Input
          id="location"
          name="location"
          type="text"
          defaultValue={profile.location ?? ""}
          placeholder="npr. Beograd"
          className="mt-1 max-w-md rounded-none border-[var(--ar-gray-300)] bg-white focus-visible:border-[var(--color-orange)] focus-visible:ring-2 focus-visible:ring-[var(--color-orange)]/20"
        />
      </div>

      <div>
        <label htmlFor="about_me" className="block text-sm font-medium text-[var(--ar-gray-700)]">
          O meni
        </label>
        <textarea
          id="about_me"
          name="about_me"
          rows={4}
          defaultValue={profile.about_me ?? ""}
          placeholder="Napišite nešto o sebi..."
          className="mt-1 w-full max-w-md rounded-none border border-[var(--ar-gray-300)] bg-white px-4 py-3 text-[15px] text-[var(--color-primary)] placeholder:text-gray-500 outline-none focus:border-[var(--color-orange)] focus:ring-2 focus:ring-[var(--color-orange)]/20"
        />
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="cursor-pointer rounded-none bg-[var(--color-orange)] hover:bg-[var(--ar-primary-hover)]"
      >
        {saving ? "Čuvanje..." : "Sačuvaj profil"}
      </Button>
    </form>
  );
}
