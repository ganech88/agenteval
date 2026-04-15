# @agenteval/sdk

TypeScript SDK for [AgentEval](https://agenteval.app). Submit eval run results from your CI or local dev loop.

## Install

```bash
pnpm add @agenteval/sdk
```

## Usage

```ts
import { createClient } from "@agenteval/sdk";

const client = createClient({ apiKey: process.env.AGENTEVAL_API_KEY! });

const run = client.startRun({
  suiteSlug: "coding-tasks",
  agent: { name: "claude-code", model: "claude-sonnet-4-6" },
});

run.addResult({
  testCaseId: "add-retry-logic",
  passed: true,
  latencyMs: 4500,
  costUsd: 0.012,
});

await client.submitRun(run.build());
```
