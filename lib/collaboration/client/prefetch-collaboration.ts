"use client";

import { mutate } from "swr";
import { prefetchCollaborationBootstrap } from "@/lib/collaboration/actions/prefetch";
import type { CollaborationBootstrap } from "@/lib/collaboration/data/queries";
import {
  COLLAB_CHANNELS_KEY,
  COLLAB_MEETINGS_KEY,
  TEAM_MEMBERS_KEY,
  TEAM_TASKS_ALL_KEY,
  collabMessagesKey,
} from "@/lib/collaboration/client/collaboration-provider";

let inflight: Promise<CollaborationBootstrap | null> | null = null;
let hydratedBootstrap: CollaborationBootstrap | null = null;

export function getPrefetchedCollaborationBootstrap() {
  return hydratedBootstrap;
}

export async function hydrateCollaborationCache(
  bootstrap: CollaborationBootstrap
) {
  hydratedBootstrap = bootstrap;

  const tasks: Array<Promise<unknown>> = [
    mutate(COLLAB_CHANNELS_KEY, bootstrap.channels, { revalidate: false }),
    mutate(TEAM_MEMBERS_KEY, bootstrap.members, { revalidate: false }),
    mutate(COLLAB_MEETINGS_KEY, bootstrap.meetings, { revalidate: false }),
    mutate(TEAM_TASKS_ALL_KEY, bootstrap.tasks, { revalidate: false }),
  ];

  for (const [channelId, messages] of Object.entries(
    bootstrap.initialMessagesByChannelId
  )) {
    tasks.push(
      mutate(collabMessagesKey(channelId), messages, { revalidate: false })
    );
  }

  await Promise.all(tasks);
  return bootstrap;
}

export function prefetchCollaboration(options?: { force?: boolean }) {
  if (hydratedBootstrap && !options?.force) {
    return Promise.resolve(hydratedBootstrap);
  }

  if (inflight && !options?.force) {
    return inflight;
  }

  inflight = prefetchCollaborationBootstrap()
    .then(async (bootstrap) => {
      if (!bootstrap) {
        return null;
      }
      await hydrateCollaborationCache(bootstrap);
      return bootstrap;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
