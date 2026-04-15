import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { runs, evalSuites } from "@agenteval/db";
import { EmptyState } from "@/components/ui/empty-state";

export default async function RunsListPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const rows = await db
    .select({
      id: runs.id,
      agentName: runs.agentName,
      agentVersion: runs.agentVersion,
      agentModel: runs.agentModel,
      passRate: runs.passRate,
      totalTests: runs.totalTests,
      passedTests: runs.passedTests,
      avgLatencyMs: runs.avgLatencyMs,
      totalCostUsd: runs.totalCostUsd,
      createdAt: runs.createdAt,
      suiteName: evalSuites.name,
      suiteSlug: evalSuites.slug,
    })
    .from(runs)
    .innerJoin(evalSuites, eq(evalSuites.id, runs.suiteId))
    .where(eq(runs.projectId, project.id))
    .orderBy(desc(runs.createdAt))
    .limit(100);

  return (
    <main className="px-6 py-8">
      <h2 className="mb-6 text-lg font-semibold">Runs</h2>

      {rows.length === 0 ? (
        <EmptyState
          title="No runs yet"
          description="Submit runs from your agent using @agenteval/sdk and an API key."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Suite</th>
                <th className="px-4 py-3">Pass rate</th>
                <th className="px-4 py-3">Tests</th>
                <th className="px-4 py-3">Avg latency</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-950">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${project.slug}/runs/${r.id}`}
                      className="font-medium text-white hover:underline"
                    >
                      {r.agentName}
                      {r.agentVersion ? (
                        <span className="ml-1 text-xs text-zinc-500">
                          @{r.agentVersion}
                        </span>
                      ) : null}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{r.suiteName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.passRate >= 0.9
                          ? "text-emerald-400"
                          : r.passRate >= 0.7
                            ? "text-amber-400"
                            : "text-red-400"
                      }
                    >
                      {Math.round(r.passRate * 100)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.passedTests}/{r.totalTests}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {Math.round(r.avgLatencyMs)}ms
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    ${r.totalCostUsd.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
