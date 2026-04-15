"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  createOrgAndProjectAction,
  type OnboardingFormState,
} from "./actions";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState<
    OnboardingFormState,
    FormData
  >(createOrgAndProjectAction, undefined);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to AgentEval</CardTitle>
            <CardDescription>
              Create your organization and first project to get started.
            </CardDescription>
          </CardHeader>

          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                name="orgName"
                placeholder="Acme Inc."
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectName">Project name</Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="Support bot"
                required
                minLength={2}
              />
            </div>
            {state?.error && (
              <p className="text-sm text-red-400">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating…" : "Create and continue"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
