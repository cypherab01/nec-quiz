"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "login" | "signup";

export function AuthCard({ mode }: Readonly<{ mode: Mode }>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to continue to NEC Quiz."
      : "Sign up to start practicing for NEC exams.";
  const submitLabel = (() => {
    if (isSubmitting)
      return mode === "login" ? "Signing in..." : "Creating account...";
    return mode === "login" ? "Sign in" : "Sign up";
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const res = await signIn.email({
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || "Failed to sign in.");
          return;
        }
      } else {
        const res = await signUp.email({
          name,
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || "Failed to sign up.");
          return;
        }
      }

      // Ensure a profile exists (default student) and redirect by role.
      const profRes = await fetch("/api/profile/ensure", { method: "POST" });
      const profJson = (await profRes.json()) as
        | { ok: true; data: { role: "admin" | "student" } }
        | { ok: false; error: { code: string; message: string } };

      if (!profJson.ok) {
        setError(`${profJson.error.code}: ${profJson.error.message}`);
        return;
      }

      // Session cookie is set by Better Auth; full reload keeps things simple.
      globalThis.location.href =
        profJson.data.role === "admin" ? "/admin" : "/play";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" ? (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
          />
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-foreground underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
