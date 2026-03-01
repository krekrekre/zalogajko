"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            author_name: authorName.trim() || null,
          },
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri registraciji.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="auth-form-card w-full max-w-[400px] text-center">
          <h1 className="auth-form-title">Proverite email</h1>
          <p className="mt-3 text-[var(--ar-gray-500)]">
            Poslali smo vam link za potvrdu. Kliknite na link u email-u da
            aktivirate nalog.
          </p>
          <Link href="/login" className="auth-form-link mt-6 inline-block">
            Idi na prijavu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="auth-form-card w-full max-w-[400px]">
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
            />
          </div>
          <Button type="submit" disabled={loading} className="auth-form-submit">
            {loading ? "Registracija..." : "Registruj se"}
          </Button>
        </form>
        <p className="auth-form-footer">
          Već imate nalog?{" "}
          <Link href="/login" className="auth-form-link">
            Prijavi se
          </Link>
        </p>
        <Link href="/" className="auth-form-back">
          ← Nazad na početnu
        </Link>
      </div>
    </div>
  );
}
