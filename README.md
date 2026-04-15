# AgentEval

SaaS platform for testing and evaluating AI agents. Define eval suites, run them against your agents from CI, track pass@k metrics over time, detect regressions.

> **Live**: https://agenteval-phi.vercel.app

## Structure

```
apps/
  web/         # Next.js 16 dashboard + API routes
packages/
  sdk/         # @agenteval/sdk — TypeScript client for ingestion
  db/          # Drizzle ORM schemas
  shared/      # Shared zod schemas + types
```

## Development

```bash
pnpm install
pnpm dev
```
