import { requireUser, requireProjectAccess } from "@/lib/auth";
import NewSuiteForm from "./form";

export default async function NewSuitePage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const user = await requireUser();
  await requireProjectAccess(user.id, projectSlug);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-8">
      <h2 className="mb-6 text-lg font-semibold">New eval suite</h2>
      <NewSuiteForm projectSlug={projectSlug} />
    </main>
  );
}
