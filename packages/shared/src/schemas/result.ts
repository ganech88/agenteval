import { z } from "zod";

export const testResultSchema = z.object({
  testCaseId: z.string(),
  passed: z.boolean(),
  score: z.number().min(0).max(1).optional(),
  output: z.unknown(),
  latencyMs: z.number().int().nonnegative().optional(),
  costUsd: z.number().nonnegative().optional(),
  tokensInput: z.number().int().nonnegative().optional(),
  tokensOutput: z.number().int().nonnegative().optional(),
  error: z.string().optional(),
  scorerResults: z
    .array(
      z.object({
        scorerType: z.string(),
        passed: z.boolean(),
        score: z.number().optional(),
        reasoning: z.string().optional(),
      })
    )
    .optional(),
});

export type TestResult = z.infer<typeof testResultSchema>;
