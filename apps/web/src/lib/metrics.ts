import type { TestResult } from "@agenteval/shared";

export interface ComputedMetrics {
  passRate: number;
  totalTests: number;
  passedTests: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
}

export function computeRunMetrics(results: TestResult[]): ComputedMetrics {
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const passRate = totalTests === 0 ? 0 : passedTests / totalTests;

  const totalCostUsd = results.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);

  const latencies = results
    .map((r) => r.latencyMs)
    .filter((x): x is number => typeof x === "number");

  const avgLatencyMs =
    latencies.length === 0
      ? 0
      : latencies.reduce((sum, x) => sum + x, 0) / latencies.length;

  const p95LatencyMs = percentile(latencies, 0.95);

  return {
    passRate,
    totalTests,
    passedTests,
    totalCostUsd,
    avgLatencyMs,
    p95LatencyMs,
  };
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
