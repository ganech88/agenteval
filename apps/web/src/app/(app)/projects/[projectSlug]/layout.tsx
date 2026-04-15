import Link from "next/link";
import { requireUser, requireProjectAccess } from "@/lib/auth";
import { ProjectTabs } from "./tabs";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  const project = await requireProjectAccess(user.id, projectSlug);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-900 px-6 pt-6">
        <div className="text-xs uppercase tracking-wider text-zinc-500">
          Project
        </div>
        <Link
          href={`/projects/${project.slug}`}
          className="text-2xl font-semibold tracking-tight"
        >
          {project.name}
        </Link>
        <ProjectTabs projectSlug={project.slug} />
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
