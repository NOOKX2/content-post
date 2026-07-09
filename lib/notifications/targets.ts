import type { Content } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TeamRow } from "@/lib/types";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export async function findUserIdsByNames(names: string[]): Promise<string[]> {
  const normalized = [...new Set(names.map(normalizeName).filter(Boolean))];
  if (normalized.length === 0) return [];

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  });

  const ids = new Set<string>();
  for (const user of users) {
    if (normalized.includes(normalizeName(user.name))) {
      ids.add(user.id);
    }
  }
  return [...ids];
}

function teamParticipantNames(team: unknown): string[] {
  if (!Array.isArray(team)) return [];
  return (team as TeamRow[])
    .map((row) => row.participant?.trim())
    .filter((name): name is string => Boolean(name));
}

export async function getContentStakeholderIds(
  content: Pick<Content, "createdById" | "team">
): Promise<string[]> {
  const ids = new Set<string>();
  if (content.createdById) {
    ids.add(content.createdById);
  }

  const teamUserIds = await findUserIdsByNames(teamParticipantNames(content.team));
  for (const id of teamUserIds) {
    ids.add(id);
  }

  return [...ids];
}

export async function getContentCreatorId(
  content: Pick<Content, "createdById">
): Promise<string | null> {
  return content.createdById;
}
