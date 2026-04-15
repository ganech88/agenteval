import type {
  IngestRunPayload,
  TestResult,
  EvalSuite,
} from "@agenteval/shared";

export type { IngestRunPayload, TestResult, EvalSuite } from "@agenteval/shared";

export interface AgentEvalClientOptions {
  apiKey: string;
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface RunBuilderInit {
  suiteSlug: string;
  agent: IngestRunPayload["agent"];
  metadata?: Record<string, unknown>;
}

export class RunBuilder {
  private results: TestResult[] = [];
  private startedAt = new Date();

  constructor(private readonly init: RunBuilderInit) {}

  addResult(result: TestResult): this {
    this.results.push(result);
    return this;
  }

  build(): IngestRunPayload {
    return {
      suiteSlug: this.init.suiteSlug,
      agent: this.init.agent,
      startedAt: this.startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      results: this.results,
      metadata: this.init.metadata,
    };
  }
}

export class AgentEvalClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AgentEvalClientOptions) {
    if (!options.apiKey) {
      throw new Error("AgentEvalClient requires an apiKey");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://agenteval.app";
    this.fetchImpl = options.fetch ?? fetch;
  }

  startRun(init: RunBuilderInit): RunBuilder {
    return new RunBuilder(init);
  }

  async submitRun(payload: IngestRunPayload): Promise<{ runId: string }> {
    const url = `${this.baseUrl}/api/v1/runs`;
    const response = await this.fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `AgentEval submitRun failed (${response.status}): ${text || response.statusText}`
      );
    }

    return (await response.json()) as { runId: string };
  }
}

export function createClient(options: AgentEvalClientOptions): AgentEvalClient {
  return new AgentEvalClient(options);
}
