"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Input } from "@/components/ui/input";
import { getSafeNextPath } from "@/lib/auth/redirects";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const next = getSafeNextPath(searchParams.get("next"));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            author_name: authorName.trim() || null,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        await fetch("/auth/bootstrap", { method: "POST" });
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setOauthLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const next = getSafeNextPath(searchParams.get("next"));
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri registraciji putem Google-a.");
      setOauthLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="auth-form-title">Proverite email</h1>
          <p className="mt-3 text-[var(--ar-gray-500)]">
            Poslali smo vam link za potvrdu. Kliknite na link u email-u da
            aktivirate nalog.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(getSafeNextPath(searchParams.get("next")))}`}
            className="auth-form-link mt-6 inline-block"
          >
            Idi na prijavu →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="auth-form-title">Registracija</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-form-error" role="alert">
              {error}
            </div>
          )}
          <div className="auth-form-field">
            <label htmlFor="authorName" className="auth-form-label">
              Autorsko ime
            </label>
            <Input
              id="authorName"
              type="text"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="auth-form-input"
              placeholder="npr. Ana Jovanović"
            />
            <p className="mt-1 text-xs text-[var(--ar-gray-500)]">
              Prikazuje se uz recepte i komentare.
            </p>
          </div>
          <div className="auth-form-field">
            <label htmlFor="email" className="auth-form-label">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-form-input"
              placeholder="vas@email.com"
            />
          </div>
          <div className="auth-form-field">
            <label htmlFor="password" className="auth-form-label">
              Lozinka (min. 6 karaktera)
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-form-input"
              placeholder="****"
            />
          </div>
          <Button type="submit" disabled={loading} className="auth-form-submit cursor-pointer">
            {loading ? "Registracija..." : "Registruj se"}
          </Button>
          <div className="relative my-4">
            <span className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-[var(--ar-gray-200)]" />
            </span>
            <span className="relative flex justify-center text-xs uppercase tracking-wide text-[var(--ar-gray-500)]">
              ili
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={loading || oauthLoading}
            onClick={handleGoogleSignUp}
            className="auth-form-submit w-full cursor-pointer gap-2 border-[var(--ar-gray-300)] bg-white hover:bg-[var(--ar-gray-50)]"
          >
            <GoogleIcon className="h-4 w-4" />
            {oauthLoading ? "Preusmjeravanje..." : "Registruj se putem Google-a"}
          </Button>
        </form>
        <p className="auth-form-footer">
          Već imate nalog?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(getSafeNextPath(searchParams.get("next")))}`}
            className="auth-form-link"
          >
            Prijavi se
          </Link>
        </p>
    </AuthLayout>
  );
}
