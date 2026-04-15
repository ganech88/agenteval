"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { evalSuiteSchema } from "@agenteval/shared";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { evalSuites } from "@agenteval/db";
import { slugify, randomSuffix } from "@/lib/slugify";

const formSchema = z.object({
  projectSlug: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  definitionJson: z.string().min(2),
});

export type SuiteFormState = { error: string } | undefined;

export async function createSuiteAction(
  _prev: SuiteFormState,
  formData: FormData
): Promise<SuiteFormState> {
  const user = await requireUser();

  const parsed = formSchema.safeParse({
    projectSlug: formData.get("projectSlug"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    definitionJson: formData.get("definitionJson"),
  });

  if (!parsed.success) {
    return { error: "Fill in all required fields." };
  }

  const project = await requireProjectAccess(user.id, parsed.data.projectSlug);

  let definition: unknown;
  try {
    definition = JSON.parse(parsed.data.definitionJson);
  } catch {
    return { error: "Definition must be valid JSON." };
  }

  const withName =
    typeof definition === "object" && definition !== null
      ? { ...(definition as Record<string, unknown>), name: parsed.data.name }
      : { name: parsed.data.name };

  const validated = evalSuiteSchema.safeParse(withName);
  if (!validated.success) {
    return {
      error: `Invalid suite definition: ${validated.error.issues[0]?.message ?? "unknown error"}`,
    };
  }

  let slug = slugify(parsed.data.name);
  if (!slug) slug = `suite-${randomSuffix()}`;

  const existing = await db
    .select({ id: evalSuites.id })
    .from(evalSuites)
    .where(and(eq(evalSuites.projectId, project.id), eq(evalSuites.slug, slug)))
    .limit(1);
  if (existing.length > 0) {
    slug = `${slug}-${randomSuffix()}`;
  }

  await db.insert(evalSuites).values({
    projectId: project.id,
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? null,
    definition: validated.data,
  });

  revalidatePath(`/projects/${project.slug}/suites`);
  redirect(`/projects/${project.slug}/suites/${slug}`);
}

export async function deleteSuiteAction(formData: FormData) {
  const user = await requireUser();
  const projectSlug = formData.get("projectSlug") as string;
  const suiteId = formData.get("suiteId") as string;

  if (!projectSlug || !suiteId) return;

  const project = await requireProjectAccess(user.id, projectSlug);

  await db
    .delete(evalSuites)
    .where(and(eq(evalSuites.id, suiteId), eq(evalSuites.projectId, project.id)));

  revalidatePath(`/projects/${project.slug}/suites`);
  redirect(`/projects/${project.slug}/suites`);
}
