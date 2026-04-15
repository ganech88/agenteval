import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { runs, evalSuites } from "@agenteval/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  const [suiteCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(evalSuites)
    .where(eq(evalSuites.projectId, project.id));
  const suiteCount = suiteCountRow?.count ?? 0;

  const recentRuns = await db
    .select({
      id: runs.id,
      agentName: runs.agentName,
      agentVersion: runs.agentVersion,
      passRate: runs.passRate,
      totalTests: runs.totalTests,
      passedTests: runs.passedTests,
      createdAt: runs.createdAt,
    })
    .from(runs)
    .where(eq(runs.projectId, project.id))
    .orderBy(desc(runs.createdAt))
    .limit(10);

  return (
    <main className="px-6 py-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Eval suites</CardDescription>
            <CardTitle>{suiteCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total runs</CardDescription>
            <CardTitle>{recentRuns.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Last pass rate</CardDescription>
            <CardTitle>
              {recentRuns[0]
                ? `${Math.round(recentRuns[0].passRate * 100)}%`
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Recent runs</h2>
      {recentRuns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          No runs yet. Create an eval suite and submit runs via the SDK.
          <div className="mt-4">
            <Link
              href={`/projects/${project.slug}/suites/new`}
              className="text-zinc-200 underline"
            >
              Create your first suite →
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-900">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Pass rate</th>
                <th className="px-4 py-3">Tests</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {recentRuns.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.agentName}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.agentVersion || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {Math.round(r.passRate * 100)}%
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {r.passedTests}/{r.totalTests}
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
