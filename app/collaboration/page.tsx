import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CollaborationPageClient } from "@/app/collaboration/_components/CollaborationPageClient";
import { CollaborationShell } from "@/app/collaboration/_components/CollaborationShell";
import { getCollaborationBootstrap } from "@/lib/collaboration/data/queries";

async function CollaborationPageData() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const bootstrap = await getCollaborationBootstrap(session.user.id);

  return <CollaborationPageClient bootstrap={bootstrap} />;
}

export default function CollaborationPage() {
  return (
    <Suspense fallback={<CollaborationShell />}>
      <CollaborationPageData />
    </Suspense>
  );
}
