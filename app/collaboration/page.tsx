import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CollaborationPageClient } from "@/app/collaboration/_components/CollaborationPageClient";
import { getCollaborationBootstrap } from "@/lib/collaboration/data/queries";

export default async function CollaborationPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const bootstrap = await getCollaborationBootstrap(session.user.id);

  return <CollaborationPageClient bootstrap={bootstrap} />;
}
