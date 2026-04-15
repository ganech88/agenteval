import Link from "next/link";
import { requireUser, getUserProjects } from "@/lib/auth";
import { logoutAction } from "../(auth)/actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const projects = await getUserProjects(user.id);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-zinc-900 bg-zinc-950 px-4 py-6">
        <Link
          href="/dashboard"
          className="mb-8 px-2 text-lg font-semibold tracking-tight"
        >
          AgentEval
        </Link>

        <div className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Projects
        </div>
        <nav className="flex flex-col gap-1">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              className="rounded-md px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              {p.name}
            </Link>
          ))}
          <Link
            href="/projects/new"
            className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
          >
            + New project
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-zinc-900 pt-4">
          <div className="truncate px-2 text-xs text-zinc-500">
            {user.email}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
