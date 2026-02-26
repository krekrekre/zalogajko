"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      {checkingAuth ? (
        <p className="text-[var(--ar-gray-500)]">Učitavanje...</p>
      ) : (
        <div className="auth-form-card w-full max-w-[400px]">
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
              />
            </div>
            <Button type="submit" disabled={loading} className="auth-form-submit">
              {loading ? "Prijava..." : "Prijavi se"}
            </Button>
          </form>
          <p className="auth-form-footer">
            Nemate nalog?{" "}
            <Link href="/signup" className="auth-form-link">
              Registruj se
            </Link>
          </p>
          <Link href="/" className="auth-form-back">
            ← Nazad na početnu
          </Link>
        </div>
      )}
    </div>
  );
}
