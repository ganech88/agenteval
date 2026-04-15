import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { organizations, orgMembers, projects } from "@agenteval/db";
import { eq, and } from "drizzle-orm";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function getUserOrgs(userId: string) {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: orgMembers.role,
    })
    .from(orgMembers)
    .innerJoin(organizations, eq(orgMembers.orgId, organizations.id))
    .where(eq(orgMembers.userId, userId))
    .orderBy(organizations.createdAt);
}

export async function getUserProjects(userId: string) {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      orgId: projects.orgId,
      orgName: organizations.name,
      orgSlug: organizations.slug,
    })
    .from(projects)
    .innerJoin(orgMembers, eq(orgMembers.orgId, projects.orgId))
    .innerJoin(organizations, eq(organizations.id, projects.orgId))
    .where(eq(orgMembers.userId, userId))
    .orderBy(projects.createdAt);
}

export async function requireProjectAccess(userId: string, projectSlug: string) {
  const rows = await db
    .select({
      project: projects,
      orgRole: orgMembers.role,
    })
    .from(projects)
    .innerJoin(orgMembers, and(eq(orgMembers.orgId, projects.orgId), eq(orgMembers.userId, userId)))
    .where(eq(projects.slug, projectSlug))
    .limit(1);

  const row = rows[0];
  if (!row) redirect("/dashboard");
  return row.project;
}
