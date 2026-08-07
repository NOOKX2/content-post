export const TEAM_CHANNEL_SLUG = "team-content";

export function isTeamChannel(slug: string) {
  return slug === TEAM_CHANNEL_SLUG;
}

export function isDmChannel(slug: string) {
  return slug.startsWith("dm-");
}

export function isGroupChannel(slug: string) {
  return slug.startsWith("group-");
}

export function dmSlug(userIdA: string, userIdB: string) {
  const [a, b] = [userIdA, userIdB].sort();
  return `dm-${a}-${b}`;
}

/** Parse peer user id from slug `dm-{idA}-{idB}` (ids sorted lexicographically). */
export function peerIdFromDmSlug(slug: string, userId: string): string | null {
  if (!isDmChannel(slug)) return null;
  const rest = slug.slice(3);
  if (rest.startsWith(`${userId}-`)) {
    return rest.slice(userId.length + 1);
  }
  if (rest.endsWith(`-${userId}`)) {
    return rest.slice(0, -(userId.length + 1));
  }
  return null;
}

export function userIsDmParticipant(slug: string, userId: string) {
  return peerIdFromDmSlug(slug, userId) !== null;
}
