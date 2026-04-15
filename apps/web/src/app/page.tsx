import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold tracking-tight">AgentEval</span>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/login" className="hover:text-white">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-white px-3 py-1.5 font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Test and evaluate your AI agents.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          Build eval suites, run them from your CI, and track regressions over
          time. Pass@k, latency, cost, and custom scorers — all in one
          dashboard.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200"
          >
            Get started free
          </Link>
          <a
            href="https://github.com/ganech88/agenteval"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-900"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} AgentEval
      </footer>
    </main>
  );
}
