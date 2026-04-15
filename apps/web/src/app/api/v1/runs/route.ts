import { and, eq } from "drizzle-orm";
import { ingestRunSchema } from "@agenteval/shared";
import { db } from "@/lib/db";
import { evalSuites, runs, testResults } from "@agenteval/db";
import { authenticateApiKey } from "@/lib/api-auth";
import { computeRunMetrics } from "@/lib/metrics";

export async function POST(request: Request) {
  const authed = await authenticateApiKey(request);
  if (!authed) {
    return Response.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ingestRunSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid payload",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const [suite] = await db
    .select({ id: evalSuites.id })
    .from(evalSuites)
    .where(
      and(
        eq(evalSuites.projectId, authed.projectId),
        eq(evalSuites.slug, payload.suiteSlug)
      )
    )
    .limit(1);

  if (!suite) {
    return Response.json(
      { error: `Suite '${payload.suiteSlug}' not found in this project` },
      { status: 404 }
    );
  }

  const metrics = computeRunMetrics(payload.results);

  const [run] = await db
    .insert(runs)
    .values({
      suiteId: suite.id,
      projectId: authed.projectId,
      agentName: payload.agent.name,
      agentVersion: payload.agent.version ?? null,
      agentModel: payload.agent.model ?? null,
      agentConfig: payload.agent.config ?? null,
      startedAt: new Date(payload.startedAt),
      finishedAt: new Date(payload.finishedAt),
      passRate: metrics.passRate,
      totalTests: metrics.totalTests,
      passedTests: metrics.passedTests,
      totalCostUsd: metrics.totalCostUsd,
      avgLatencyMs: metrics.avgLatencyMs,
      p95LatencyMs: metrics.p95LatencyMs,
      metadata: payload.metadata ?? null,
    })
    .returning({ id: runs.id });

  if (payload.results.length > 0) {
    await db.insert(testResults).values(
      payload.results.map((r) => ({
        runId: run.id,
        testCaseId: r.testCaseId,
        passed: r.passed,
        score: r.score ?? null,
        output: (r.output ?? null) as never,
        latencyMs: r.latencyMs ?? null,
        costUsd: r.costUsd ?? null,
        tokensInput: r.tokensInput ?? null,
        tokensOutput: r.tokensOutput ?? null,
        error: r.error ?? null,
        scorerResults: (r.scorerResults ?? null) as never,
      }))
    );
  }

  return Response.json(
    {
      id: run.id,
      projectSlug: authed.projectSlug,
      metrics,
    },
    { status: 201 }
  );
}
