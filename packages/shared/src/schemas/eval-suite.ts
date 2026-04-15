import { z } from "zod";

export const scorerSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("exact_match"),
    expected: z.string(),
    caseSensitive: z.boolean().default(true),
  }),
  z.object({
    type: z.literal("regex"),
    pattern: z.string(),
    flags: z.string().optional(),
  }),
  z.object({
    type: z.literal("llm_judge"),
    rubric: z.string(),
    model: z.string().default("claude-haiku-4-5"),
    passThreshold: z.number().min(0).max(1).default(0.7),
  }),
  z.object({
    type: z.literal("contains"),
    substring: z.string(),
  }),
]);

export type Scorer = z.infer<typeof scorerSchema>;

export const testCaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  input: z.unknown(),
  expected: z.unknown().optional(),
  scorers: z.array(scorerSchema).min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TestCase = z.infer<typeof testCaseSchema>;

export const evalSuiteSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  testCases: z.array(testCaseSchema).min(1),
});

export type EvalSuite = z.infer<typeof evalSuiteSchema>;
