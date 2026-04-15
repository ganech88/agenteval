import {
  pgSchema,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  doublePrecision,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const agenteval = pgSchema("agenteval");

export const organizations = agenteval.table("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orgMembers = agenteval.table(
  "org_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("org_members_org_user_idx").on(t.orgId, t.userId)]
);

export const projects = agenteval.table(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("projects_org_slug_idx").on(t.orgId, t.slug)]
);

export const apiKeys = agenteval.table(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull().unique(),
    keyPrefix: text("key_prefix").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("api_keys_project_idx").on(t.projectId)]
);

export const evalSuites = agenteval.table(
  "eval_suites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    definition: jsonb("definition").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("eval_suites_project_slug_idx").on(t.projectId, t.slug)]
);

export const runs = agenteval.table(
  "runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    suiteId: uuid("suite_id")
      .notNull()
      .references(() => evalSuites.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    agentName: text("agent_name").notNull(),
    agentVersion: text("agent_version"),
    agentModel: text("agent_model"),
    agentConfig: jsonb("agent_config"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }).notNull(),
    passRate: doublePrecision("pass_rate").notNull(),
    totalTests: integer("total_tests").notNull(),
    passedTests: integer("passed_tests").notNull(),
    totalCostUsd: doublePrecision("total_cost_usd").notNull().default(0),
    avgLatencyMs: doublePrecision("avg_latency_ms").notNull().default(0),
    p95LatencyMs: doublePrecision("p95_latency_ms").notNull().default(0),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("runs_suite_created_idx").on(t.suiteId, t.createdAt),
    index("runs_project_created_idx").on(t.projectId, t.createdAt),
  ]
);

export const testResults = agenteval.table(
  "test_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id")
      .notNull()
      .references(() => runs.id, { onDelete: "cascade" }),
    testCaseId: text("test_case_id").notNull(),
    passed: boolean("passed").notNull(),
    score: doublePrecision("score"),
    output: jsonb("output"),
    latencyMs: integer("latency_ms"),
    costUsd: doublePrecision("cost_usd"),
    tokensInput: integer("tokens_input"),
    tokensOutput: integer("tokens_output"),
    error: text("error"),
    scorerResults: jsonb("scorer_results"),
  },
  (t) => [index("test_results_run_idx").on(t.runId)]
);

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(orgMembers),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  org: one(organizations, { fields: [projects.orgId], references: [organizations.id] }),
  apiKeys: many(apiKeys),
  evalSuites: many(evalSuites),
  runs: many(runs),
}));

export const evalSuitesRelations = relations(evalSuites, ({ one, many }) => ({
  project: one(projects, { fields: [evalSuites.projectId], references: [projects.id] }),
  runs: many(runs),
}));

export const runsRelations = relations(runs, ({ one, many }) => ({
  suite: one(evalSuites, { fields: [runs.suiteId], references: [evalSuites.id] }),
  project: one(projects, { fields: [runs.projectId], references: [projects.id] }),
  results: many(testResults),
}));

export const testResultsRelations = relations(testResults, ({ one }) => ({
  run: one(runs, { fields: [testResults.runId], references: [runs.id] }),
}));
