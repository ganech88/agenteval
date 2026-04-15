import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { runs, evalSuites, testResults } from "@agenteval/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ projectSlug: string; runId: string }>;
}) {
  const { projectSlug, runId } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const [row] = await db
    .select({
      run: runs,
      suiteName: evalSuites.name,
      suiteSlug: evalSuites.slug,
    })
    .from(runs)
    .innerJoin(evalSuites, eq(evalSuites.id, runs.suiteId))
    .where(and(eq(runs.id, runId), eq(runs.projectId, project.id)))
    .limit(1);

  if (!row) notFound();
  const { run, suiteName, suiteSlug } = row;

  const results = await db
    .select()
    .from(testResults)
    .where(eq(testResults.runId, run.id));

  return (
    <main className="px-6 py-8">
      <div className="mb-2 text-xs text-zinc-500">
        <Link
          href={`/projects/${project.slug}/runs`}
          className="hover:text-zinc-300"
        >
          ← Runs
        </Link>
      </div>
      <h2 className="text-lg font-semibold">
        {run.agentName}
        {run.agentVersion ? (
          <span className="ml-2 text-sm text-zinc-500">
            @{run.agentVersion}
          </span>
        ) : null}
      </h2>
      <div className="mt-1 text-sm text-zinc-500">
        Suite:{" "}
        <Link
          href={`/projects/${project.slug}/suites/${suiteSlug}`}
          className="text-zinc-300 hover:underline"
        >
          {suiteName}
        </Link>
        {run.agentModel ? ` · Model: ${run.agentModel}` : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Card>
          <CardHeader>
            <CardDescription>Pass rate</CardDescription>
            <CardTitle>{Math.round(run.passRate * 100)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tests</CardDescription>
            <CardTitle>
              {run.passedTests}/{run.totalTests}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg latency</CardDescription>
            <CardTitle>{Math.round(run.avgLatencyMs)}ms</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>p95 latency</CardDescription>
            <CardTitle>{Math.round(run.p95LatencyMs)}ms</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total cost</CardDescription>
            <CardTitle>${run.totalCostUsd.toFixed(4)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h3 className="mt-10 mb-3 text-sm font-semibold">Test results</h3>
      <div className="overflow-hidden rounded-lg border border-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3">Test case</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Latency</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {results.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  {r.passed ? (
                    <span className="text-emerald-400">●</span>
                  ) : (
                    <span className="text-red-400">●</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.testCaseId}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.score !== null ? r.score.toFixed(2) : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.latencyMs !== null ? `${r.latencyMs}ms` : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.costUsd !== null ? `$${r.costUsd.toFixed(4)}` : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-red-400">
                  {r.error ? (
                    <span className="line-clamp-1">{r.error}</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
