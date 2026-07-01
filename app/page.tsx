import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDefaultPathForRole } from "@/lib/auth/routes";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  redirect(getDefaultPathForRole(session.user.role));
}
