import { z } from "zod";
import { testResultSchema } from "./result";

export const ingestRunSchema = z.object({
  suiteSlug: z.string().min(1),
  agent: z.object({
    name: z.string().min(1),
    version: z.string().optional(),
    model: z.string().optional(),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
  results: z.array(testResultSchema).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type IngestRunPayload = z.infer<typeof ingestRunSchema>;

export const runMetricsSchema = z.object({
  passRate: z.number().min(0).max(1),
  passAt1: z.number().min(0).max(1),
  totalTests: z.number().int().nonnegative(),
  passedTests: z.number().int().nonnegative(),
  totalCostUsd: z.number().nonnegative(),
  avgLatencyMs: z.number().nonnegative(),
  p95LatencyMs: z.number().nonnegative(),
});

export type RunMetrics = z.infer<typeof runMetricsSchema>;
