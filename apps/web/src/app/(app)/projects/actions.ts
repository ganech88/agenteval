"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { orgMembers, projects } from "@agenteval/db";
import { slugify, randomSuffix } from "@/lib/slugify";

const newProjectSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(2).max(80),
});

export type NewProjectFormState = { error: string } | undefined;

export async function createProjectAction(
  _prev: NewProjectFormState,
  formData: FormData
): Promise<NewProjectFormState> {
  const user = await requireUser();

  const parsed = newProjectSchema.safeParse({
    orgId: formData.get("orgId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: "Enter a project name." };
  }

  const membership = await db
    .select({ id: orgMembers.id })
    .from(orgMembers)
    .where(
      and(eq(orgMembers.orgId, parsed.data.orgId), eq(orgMembers.userId, user.id))
    )
    .limit(1);

  if (membership.length === 0) {
    return { error: "You don't have access to that organization." };
  }

  let slug = slugify(parsed.data.name);
  if (!slug) slug = `project-${randomSuffix()}`;

  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.orgId, parsed.data.orgId), eq(projects.slug, slug)))
    .limit(1);
  if (existing.length > 0) {
    slug = `${slug}-${randomSuffix()}`;
  }

  const [project] = await db
    .insert(projects)
    .values({
      orgId: parsed.data.orgId,
      name: parsed.data.name,
      slug,
    })
    .returning();

  redirect(`/projects/${project.slug}`);
}
