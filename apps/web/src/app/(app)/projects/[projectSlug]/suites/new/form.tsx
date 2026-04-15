"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createSuiteAction, type SuiteFormState } from "../actions";

const EXAMPLE_DEFINITION = `{
  "testCases": [
    {
      "id": "tc-1",
      "name": "Greets the user",
      "input": { "message": "Hello" },
      "scorers": [
        { "type": "contains", "substring": "hello" }
      ]
    }
  ]
}`;

interface NewSuiteFormProps {
  projectSlug: string;
}

export default function NewSuiteForm({ projectSlug }: NewSuiteFormProps) {
  const [state, formAction, pending] = useActionState<SuiteFormState, FormData>(
    createSuiteAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectSlug" value={projectSlug} />
      <div className="space-y-1.5">
        <Label htmlFor="name">Suite name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Support bot — smoke tests"
          required
          minLength={2}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          name="description"
          placeholder="Run before every deploy"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="definitionJson">Definition (JSON)</Label>
        <Textarea
          id="definitionJson"
          name="definitionJson"
          rows={16}
          defaultValue={EXAMPLE_DEFINITION}
          required
        />
        <p className="text-xs text-zinc-500">
          Paste an eval suite JSON. Must include a <code>testCases</code> array.
        </p>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create suite"}
      </Button>
    </form>
  );
}
