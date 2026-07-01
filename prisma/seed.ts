import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

const SEED_CONTENT = [
  {
    contentId: "10001",
    name: "Hero Serum Launch Video",
    mediaType: "video" as const,
    channel: "Official",
    platforms: ["facebook", "instagram", "tiktok"] as const,
    details: "วิดีโอเปิดตัว Hero Serum สไตล์ lifestyle herbal",
    location: ["Studio A"],
    scheduledDate: "2026-06-15",
    scheduledTime: "10:00",
    endTime: "12:00",
    team: [
      { id: "1", participant: "Laura Power", responsibility: "Presenter" },
      { id: "2", participant: "วิชัย สร้างสรรค์", responsibility: "Camera" },
    ],
    productsNeeded: ["Hero Serum"],
    itemsToPrepare: "Backdrop สีเขียว, Props สมุนไพร",
    attachments: [] as string[],
    script: [
      {
        id: "s1",
        duration: "0:00-0:15",
        action: "Open with product shot",
        dialogue: "สวัสดีค่ะ วันนี้มาแนะนำ Hero Serum",
        notes: "Close-up macro",
      },
    ],
    ideaCreator: "Laura Power",
    photographer: "พิมพ์ใจ ถ่ายทำ",
    editor: "กนก ตัดต่อ",
    status: "approved" as const,
    category: "Hero Video",
    tags: ["Hero Product"],
  },
  {
    contentId: "10002",
    name: "Farm Fresh Behind the Scenes",
    mediaType: "video" as const,
    channel: "วังน้ำเขียวฟาร์ม",
    platforms: ["facebook", "tiktok", "line"] as const,
    details: "Behind the scenes การเก็บเกี่ยวสมุนไพรที่ฟาร์ม",
    location: ["Farm Location"],
    scheduledDate: "2026-06-17",
    scheduledTime: "09:00",
    endTime: "11:00",
    team: [{ id: "1", participant: "มานี มีสุข", responsibility: "Presenter" }],
    productsNeeded: ["Herbal Tea Set"],
    itemsToPrepare: "Outdoor mic, Drone",
    attachments: [] as string[],
    script: [] as object[],
    ideaCreator: "มานี มีสุข",
    photographer: "พิมพ์ใจ ถ่ายทำ",
    editor: "กนก ตัดต่อ",
    status: "pending" as const,
    category: "Behind the Scenes",
    tags: ["Farm"],
  },
  {
    contentId: "10003",
    name: "Gift Set Teaser",
    mediaType: "image" as const,
    channel: "ของชำร่วย",
    platforms: ["instagram", "lemon8"] as const,
    details: "ภาพ Teaser ชุดของขวัญสมุนไพร",
    location: ["Studio A"],
    scheduledDate: "2026-06-18",
    scheduledTime: "14:00",
    endTime: "15:00",
    team: [] as object[],
    productsNeeded: ["Gift Set"],
    itemsToPrepare: "Ribbon, Gift box props",
    attachments: [] as string[],
    script: [] as object[],
    ideaCreator: "Laura Power",
    photographer: "พิมพ์ใจ ถ่ายทำ",
    editor: "กนก ตัดต่อ",
    status: "pending" as const,
    category: "Recap / Teaser",
    tags: ["Gift"],
  },
];

async function main() {
  const adminPassword = await hashPassword("admin1234");
  const userPassword = await hashPassword("user1234");

  const admin = await prisma.user.upsert({
    where: { email: "admin@idea.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@idea.local",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const creator = await prisma.user.upsert({
    where: { email: "creator@idea.local" },
    update: {},
    create: {
      name: "Creator Demo",
      email: "creator@idea.local",
      password: userPassword,
      role: Role.USER,
    },
  });

  for (const item of SEED_CONTENT) {
    await prisma.content.upsert({
      where: { contentId: item.contentId },
      update: {},
      create: {
        ...item,
        platforms: [...item.platforms],
        createdById: creator.id,
      },
    });
  }

  console.log("Seed completed:");
  console.log("  Admin:   admin@idea.local / admin1234");
  console.log("  Creator: creator@idea.local / user1234");
  console.log(`  Content: ${SEED_CONTENT.length} items`);
  console.log(`  Admin id: ${admin.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
