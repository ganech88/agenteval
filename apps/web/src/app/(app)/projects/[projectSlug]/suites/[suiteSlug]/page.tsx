import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { evalSuites } from "@agenteval/db";
import { Button } from "@/components/ui/button";
import { deleteSuiteAction } from "../actions";

export default async function SuiteDetailPage({
  params,
}: {
  params: Promise<{ projectSlug: string; suiteSlug: string }>;
}) {
  const { projectSlug, suiteSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const [suite] = await db
    .select()
    .from(evalSuites)
    .where(
      and(eq(evalSuites.projectId, project.id), eq(evalSuites.slug, suiteSlug))
    )
    .limit(1);

  if (!suite) notFound();

  const definition = suite.definition as {
    testCases?: Array<{ id: string; name: string }>;
  };

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{suite.name}</h2>
          {suite.description && (
            <p className="mt-1 text-sm text-zinc-500">{suite.description}</p>
          )}
        </div>
        <form action={deleteSuiteAction}>
          <input type="hidden" name="projectSlug" value={project.slug} />
          <input type="hidden" name="suiteId" value={suite.id} />
          <Button variant="danger" size="sm" type="submit">
            Delete
          </Button>
        </form>
      </div>

      <div className="mb-8">
        <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
          Test cases ({definition.testCases?.length ?? 0})
        </div>
        <div className="divide-y divide-zinc-900 rounded-lg border border-zinc-900">
          {definition.testCases?.map((tc) => (
            <div key={tc.id} className="px-4 py-3 text-sm">
              <div className="font-medium">{tc.name}</div>
              <div className="text-xs text-zinc-500">{tc.id}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500">
          Raw definition
        </div>
        <pre className="overflow-auto rounded-lg border border-zinc-900 bg-zinc-950 p-4 text-xs text-zinc-300">
          {JSON.stringify(suite.definition, null, 2)}
        </pre>
      </div>
    </main>
  );
}
