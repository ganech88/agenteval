import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiKeys, projects } from "@agenteval/db";
import { hashApiKey } from "@/lib/api-keys";

export interface AuthedProject {
  projectId: string;
  projectSlug: string;
  orgId: string;
  apiKeyId: string;
}

export async function authenticateApiKey(
  request: Request
): Promise<AuthedProject | null> {
  const header = request.headers.get("authorization");
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1].trim();
  if (!token.startsWith("ae_live_")) return null;

  const hash = hashApiKey(token);

  const rows = await db
    .select({
      apiKeyId: apiKeys.id,
      projectId: projects.id,
      projectSlug: projects.slug,
      orgId: projects.orgId,
    })
    .from(apiKeys)
    .innerJoin(projects, eq(projects.id, apiKeys.projectId))
    .where(and(eq(apiKeys.keyHash, hash), isNull(apiKeys.revokedAt)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, row.apiKeyId));

  return row;
}
