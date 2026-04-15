import { desc, eq } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@agenteval/db";
import ApiKeysPanel from "./panel";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.projectId, project.id))
    .orderBy(desc(apiKeys.createdAt));

  return (
    <main className="px-6 py-8">
      <h2 className="mb-6 text-lg font-semibold">Project settings</h2>

      <section className="mb-10">
        <div className="mb-2 text-sm font-medium">Project info</div>
        <div className="rounded-lg border border-zinc-900 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Name</span>
            <span>{project.name}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-zinc-500">Slug</span>
            <code className="text-zinc-300">{project.slug}</code>
          </div>
        </div>
      </section>

      <ApiKeysPanel
        projectSlug={project.slug}
        keys={keys.map((k) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.keyPrefix,
          createdAt: k.createdAt.toISOString(),
          lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
          revokedAt: k.revokedAt?.toISOString() ?? null,
        }))}
      />
    </main>
  );
}
