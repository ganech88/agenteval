import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight text-zinc-100"
      >
        AgentEval
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
