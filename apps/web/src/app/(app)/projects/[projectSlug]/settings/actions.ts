"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiKeys } from "@agenteval/db";
import { generateApiKey } from "@/lib/api-keys";

const createKeySchema = z.object({
  projectSlug: z.string(),
  name: z.string().min(1).max(60),
});

export type CreateKeyState =
  | { error: string }
  | { revealedKey: string; keyName: string }
  | undefined;

export async function createApiKeyAction(
  _prev: CreateKeyState,
  formData: FormData
): Promise<CreateKeyState> {
  const user = await requireUser();

  const parsed = createKeySchema.safeParse({
    projectSlug: formData.get("projectSlug"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "Enter a name for the API key." };
  }

  const project = await requireProjectAccess(user.id, parsed.data.projectSlug);

  const { key, prefix, hash } = generateApiKey();

  await db.insert(apiKeys).values({
    projectId: project.id,
    name: parsed.data.name,
    keyHash: hash,
    keyPrefix: prefix,
  });

  revalidatePath(`/projects/${project.slug}/settings`);
  return { revealedKey: key, keyName: parsed.data.name };
}

export async function revokeApiKeyAction(formData: FormData) {
  const user = await requireUser();
  const projectSlug = formData.get("projectSlug") as string;
  const keyId = formData.get("keyId") as string;

  if (!projectSlug || !keyId) return;

  const project = await requireProjectAccess(user.id, projectSlug);

  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.projectId, project.id)));

  revalidatePath(`/projects/${project.slug}/settings`);
}
