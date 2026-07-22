"use client";

import { CalendarPageClient } from "@/components/calendar/calendar-page-client";
import { AdminChannelsView } from "@/components/views/admin-channels-view";
import { AdminView } from "@/components/views/admin-view";
import { CreateView } from "@/components/views/create-view";
import { DashboardView } from "@/components/views/dashboard-view";
import { CollaborationView } from "@/components/views/collaboration-view";
import { PostsView } from "@/components/views/posts-view";
import { MyTasksView } from "@/components/views/my-tasks-view";
import { ContentDetailViewPage } from "@/components/views/content-detail-view-page";
import {
  parseDashboardRoute,
  useDashboardNav,
} from "@/lib/navigation/dashboard-nav";

export function DashboardRouter() {
  const { activePath } = useDashboardNav();
  const route = parseDashboardRoute(activePath);

  if (!route) {
    return null;
  }

  switch (route.view) {
    case "dashboard":
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <DashboardView />
        </div>
      );
    case "collaboration":
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <CollaborationView />
        </div>
      );
    case "calendar":
      return <CalendarPageClient />;
    case "admin":
      return <AdminView />;
    case "admin-channels":
      return <AdminChannelsView />;
    case "create":
      return <CreateView />;
    case "posts":
      return <PostsView />;
    case "my-tasks":
      return <MyTasksView />;
    case "content-detail":
      return <ContentDetailViewPage key={route.id} id={route.id} />;
    default:
      return null;
  }
}
