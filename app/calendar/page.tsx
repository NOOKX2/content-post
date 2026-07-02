import { auth } from "@/auth";
import { getAllContents } from "@/lib/content/queries";
import { CalendarPageClient } from "@/components/calendar/calendar-page-client";

export default async function CalendarPage() {
  const [contents, session] = await Promise.all([getAllContents(), auth()]);

  return <CalendarPageClient contents={contents} session={session} />;
}
