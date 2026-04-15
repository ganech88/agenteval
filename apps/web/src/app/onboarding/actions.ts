"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, orgMembers, projects } from "@agenteval/db";
import { slugify, randomSuffix } from "@/lib/slugify";

const schema = z.object({
  orgName: z.string().min(2).max(80),
  projectName: z.string().min(2).max(80),
});

export type OnboardingFormState = { error: string } | undefined;

export async function createOrgAndProjectAction(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    orgName: formData.get("orgName"),
    projectName: formData.get("projectName"),
  });

  if (!parsed.success) {
    return { error: "Enter an organization name and a project name." };
  }

  let orgSlug = slugify(parsed.data.orgName);
  if (!orgSlug) orgSlug = `org-${randomSuffix()}`;

  const existingOrg = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, orgSlug))
    .limit(1);
  if (existingOrg.length > 0) {
    orgSlug = `${orgSlug}-${randomSuffix()}`;
  }

  const [org] = await db
    .insert(organizations)
    .values({ name: parsed.data.orgName, slug: orgSlug })
    .returning();

  await db.insert(orgMembers).values({
    orgId: org.id,
    userId: user.id,
    role: "owner",
  });

  let projectSlug = slugify(parsed.data.projectName);
  if (!projectSlug) projectSlug = `project-${randomSuffix()}`;

  const [project] = await db
    .insert(projects)
    .values({
      orgId: org.id,
      name: parsed.data.projectName,
      slug: projectSlug,
    })
    .returning();

  redirect(`/projects/${project.slug}`);
}
