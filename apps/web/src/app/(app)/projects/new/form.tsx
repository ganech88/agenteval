"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProjectAction,
  type NewProjectFormState,
} from "../actions";

interface NewProjectFormProps {
  orgs: { id: string; name: string }[];
}

export default function NewProjectForm({ orgs }: NewProjectFormProps) {
  const [state, formAction, pending] = useActionState<
    NewProjectFormState,
    FormData
  >(createProjectAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="orgId">Organization</Label>
        <select
          id="orgId"
          name="orgId"
          className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
          required
          defaultValue={orgs[0]?.id}
        >
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Support bot"
          required
          minLength={2}
        />
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </Button>
    </form>
  );
}
