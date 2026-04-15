"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginAction, type AuthFormState } from "../actions";

function NextParamInput() {
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  return <input type="hidden" name="next" value={next} />;
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    loginAction,
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Welcome back to AgentEval.</CardDescription>
      </CardHeader>

      <form action={formAction} className="space-y-4">
        <Suspense fallback={null}>
          <NextParamInput />
        </Suspense>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        No account?{" "}
        <Link href="/signup" className="text-zinc-100 underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
