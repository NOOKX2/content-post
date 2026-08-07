"use client";

import { CalendarPageClient } from "@/app/calendar/_components/CalendarPageClient";
import { AdminView } from "@/app/admin/_components/AdminView";
import { CreateView } from "@/app/create/_components/CreateView";
import { DashboardView } from "@/app/dashboard/_components/DashboardView";
import { CollaborationView } from "@/app/collaboration/_components/CollaborationView";
import { PostsView } from "@/app/posts/_components/PostsView";
import { MyTasksView } from "@/app/my-tasks/_components/MyTasksView";
import { ContentDetailViewPage } from "@/app/content/[id]/_components/ContentDetailViewPage";
import {
  parseDashboardRoute,
  useDashboardNav,
} from "@/lib/navigation/client/dashboard-nav";

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
