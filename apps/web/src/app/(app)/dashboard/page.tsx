import { redirect } from "next/navigation";
import { requireUser, getUserProjects } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const projects = await getUserProjects(user.id);

  if (projects.length === 0) {
    redirect("/onboarding");
  }

  redirect(`/projects/${projects[0].slug}`);
}
