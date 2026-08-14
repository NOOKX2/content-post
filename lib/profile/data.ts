import { prisma } from "@/lib/shared/prisma";
import {
  resolveDisplayName,
  type UserProfile,
} from "@/lib/profile/types";

export async function getMyProfile(
  userId: string
): Promise<UserProfile | null> {
  const [user, openTaskCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        phoneCountry: true,
        position: true,
        imageUrl: true,
        busy: true,
        role: true,
      },
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: "done" },
      },
    }),
  ]);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: resolveDisplayName(user),
    phone: user.phone,
    phoneCountry: user.phoneCountry || "+66",
    position: user.position,
    imageUrl: user.imageUrl,
    busy: user.busy,
    role: user.role,
    openTaskCount,
  };
}
