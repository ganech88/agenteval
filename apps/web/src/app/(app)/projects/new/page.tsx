import { redirect } from "next/navigation";
import { requireUser, getUserOrgs } from "@/lib/auth";
import NewProjectForm from "./form";

export default async function NewProjectPage() {
  const user = await requireUser();
  const orgs = await getUserOrgs(user.id);

  if (orgs.length === 0) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        New project
      </h1>
      <NewProjectForm orgs={orgs.map((o) => ({ id: o.id, name: o.name }))} />
    </main>
  );
}
