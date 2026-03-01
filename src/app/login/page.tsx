"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          const next = searchParams.get("next") ?? "/";
          router.replace(next);
          return;
        }
        setCheckingAuth(false);
      });
  }, [router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri prijavi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setOauthLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri prijavi putem Google-a.");
      setOauthLoading(false);
    }
  }

  return (
    <AuthLayout>
      {checkingAuth ? (
        <p className="text-[var(--ar-gray-500)]">Učitavanje...</p>
      ) : (
        <>
          <h1 className="auth-form-title">Prijava</h1>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-form-error" role="alert">
                {error}
              </div>
            )}
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
                Lozinka
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-form-input"
                placeholder="****"
              />
            </div>
            <Button type="submit" disabled={loading} className="auth-form-submit">
              {loading ? "Prijava..." : "Prijavi se"}
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
              onClick={handleGoogleSignIn}
              className="auth-form-submit w-full gap-2 border-[var(--ar-gray-300)] bg-white hover:bg-[var(--ar-gray-50)]"
            >
              <GoogleIcon className="h-4 w-4" />
              {oauthLoading ? "Preusmjeravanje..." : "Prijavi se putem Google-a"}
            </Button>
          </form>
          <p className="auth-form-footer">
            Nemate nalog?{" "}
            <Link href="/signup" className="auth-form-link">
              Registruj se
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
