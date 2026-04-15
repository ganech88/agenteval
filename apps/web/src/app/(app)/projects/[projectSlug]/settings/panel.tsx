"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createApiKeyAction,
  revokeApiKeyAction,
  type CreateKeyState,
} from "./actions";

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

interface ApiKeysPanelProps {
  projectSlug: string;
  keys: ApiKeyRow[];
}

export default function ApiKeysPanel({ projectSlug, keys }: ApiKeysPanelProps) {
  const [state, formAction, pending] = useActionState<CreateKeyState, FormData>(
    createApiKeyAction,
    undefined
  );

  const revealedKey =
    state && "revealedKey" in state ? state.revealedKey : null;
  const errorMessage = state && "error" in state ? state.error : null;

  return (
    <section>
      <div className="mb-2 text-sm font-medium">API keys</div>
      <div className="mb-4 text-xs text-zinc-500">
        Use API keys to submit runs from your agent via the{" "}
        <code>@agenteval/sdk</code>.
      </div>

      <form action={formAction} className="mb-6 flex items-end gap-3">
        <input type="hidden" name="projectSlug" value={projectSlug} />
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="name">Key name</Label>
          <Input
            id="name"
            name="name"
            placeholder="ci-production"
            required
            minLength={1}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create key"}
        </Button>
      </form>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
      )}

      {revealedKey && (
        <div className="mb-6 rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
          <div className="mb-2 text-sm font-medium text-amber-200">
            New API key created — copy it now
          </div>
          <div className="mb-2 text-xs text-amber-300/70">
            This is the only time you&apos;ll see the full key.
          </div>
          <code className="block break-all rounded bg-zinc-950 p-3 text-xs text-zinc-100">
            {revealedKey}
          </code>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Prefix</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {keys.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-zinc-500"
                >
                  No API keys yet.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-zinc-400">
                      {k.keyPrefix}…
                    </code>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {k.revokedAt ? (
                      <span className="text-red-400">revoked</span>
                    ) : (
                      <span className="text-emerald-400">active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!k.revokedAt && (
                      <form action={revokeApiKeyAction}>
                        <input
                          type="hidden"
                          name="projectSlug"
                          value={projectSlug}
                        />
                        <input type="hidden" name="keyId" value={k.id} />
                        <button
                          type="submit"
                          className="text-xs text-zinc-400 hover:text-red-400"
                        >
                          Revoke
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
