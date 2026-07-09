"use client";

import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { AdminView } from "@/components/views/admin-view";
import { CreateView } from "@/components/views/create-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { PostsView } from "@/components/views/posts-view";
import { ContentDetailViewPage } from "@/components/views/content-detail-view-page";
import {
  parseDashboardRoute,
  useDashboardNav,
} from "@/lib/navigation/dashboard-nav";

function Panel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return <div className={active ? "contents" : "hidden"}>{children}</div>;
}

export function DashboardRouter() {
  const { activePath } = useDashboardNav();
  const route = parseDashboardRoute(activePath);

  return (
    <>
      <Panel active={route?.view === "dashboard"}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardView />
        </div>
      </Panel>
      <Panel active={route?.view === "calendar"}>
        <CalendarPageClient />
      </Panel>
      <Panel active={route?.view === "admin"}>
        <AdminView />
      </Panel>
      <Panel active={route?.view === "create"}>
        <CreateView />
      </Panel>
      <Panel active={route?.view === "posts"}>
        <PostsView />
      </Panel>
      {route?.view === "content-detail" && (
        <ContentDetailViewPage key={route.id} id={route.id} />
      )}
    </>
  );
}
