import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword("admin1234");
  const userPassword = await hashPassword("user1234");

  await prisma.user.upsert({
    where: { email: "admin@idea.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@idea.local",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "creator@idea.local" },
    update: {},
    create: {
      name: "Creator Demo",
      email: "creator@idea.local",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("Seed completed:");
  console.log("  Admin:   admin@idea.local / admin1234");
  console.log("  Creator: creator@idea.local / user1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
