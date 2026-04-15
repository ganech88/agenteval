import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { evalSuites } from "@agenteval/db";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function SuitesListPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const suites = await db
    .select({
      id: evalSuites.id,
      name: evalSuites.name,
      slug: evalSuites.slug,
      description: evalSuites.description,
      createdAt: evalSuites.createdAt,
    })
    .from(evalSuites)
    .where(eq(evalSuites.projectId, project.id))
    .orderBy(desc(evalSuites.createdAt));

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Eval suites</h2>
        <Link href={`/projects/${project.slug}/suites/new`}>
          <Button>New suite</Button>
        </Link>
      </div>

      {suites.length === 0 ? (
        <EmptyState
          title="No eval suites yet"
          description="Create a suite to start evaluating your agents."
          action={
            <Link href={`/projects/${project.slug}/suites/new`}>
              <Button>Create suite</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {suites.map((s) => (
            <Link
              key={s.id}
              href={`/projects/${project.slug}/suites/${s.slug}`}
              className="rounded-lg border border-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="text-sm font-medium text-white">{s.name}</div>
              {s.description && (
                <div className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {s.description}
                </div>
              )}
              <div className="mt-3 text-xs text-zinc-600">
                {new Date(s.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
