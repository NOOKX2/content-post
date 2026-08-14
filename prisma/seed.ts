import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/auth/domain/password";
import { seedDefaultPostingChannels } from "../lib/content/posting/posting-channels";
import { PRODUCTS } from "../lib/constants";

const prisma = new PrismaClient();

const SEED_CONTENT = [
  {
    contentId: "NKT0001",
    name: "Hero Serum Launch Video",
    mediaType: "video" as const,
    channel: "nook__th",
    platforms: ["instagram"] as const,
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
    filmingEquipment: ["Camera", "Lighting"],
    attachments: [] as string[],
    script: [
      {
        id: "s1",
        startTime: "00:00",
        endTime: "00:15",
        speaker: "พิธีกร",
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
    contentId: "NKD0001",
    name: "Farm Fresh Behind the Scenes",
    mediaType: "video" as const,
    channel: "nook_down",
    platforms: ["tiktok"] as const,
    details: "Behind the scenes การเก็บเกี่ยวสมุนไพรที่ฟาร์ม",
    location: ["Farm Location"],
    scheduledDate: "2026-06-17",
    scheduledTime: "09:00",
    endTime: "11:00",
    team: [{ id: "1", participant: "มานี มีสุข", responsibility: "Presenter" }],
    productsNeeded: ["Herbal Tea Set"],
    itemsToPrepare: "Outdoor setup",
    filmingEquipment: ["Microphone", "Drone"],
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
    contentId: "ICP0001",
    name: "Gift Set Teaser",
    mediaType: "image" as const,
    channel: "idea_content_post",
    platforms: ["instagram"] as const,
    details: "ภาพ Teaser ชุดของขวัญสมุนไพร",
    location: ["Studio A"],
    scheduledDate: "2026-06-18",
    scheduledTime: "14:00",
    endTime: "15:00",
    team: [] as object[],
    productsNeeded: ["Gift Set"],
    itemsToPrepare: "Ribbon, Gift box props",
    filmingEquipment: [] as string[],
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
  const viewerPassword = await hashPassword("viewer1234");

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
    update: { role: Role.EDITOR },
    create: {
      name: "Creator Demo",
      email: "creator@idea.local",
      password: userPassword,
      role: Role.EDITOR,
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@idea.local" },
    update: {},
    create: {
      name: "Viewer Demo",
      email: "viewer@idea.local",
      password: viewerPassword,
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

  await seedDefaultPostingChannels();

  const existingProducts = await prisma.archiveProduct.count();
  if (existingProducts === 0) {
    await prisma.archiveProduct.createMany({
      data: PRODUCTS.map((name, index) => ({
        name,
        sortOrder: index,
      })),
    });
  }

  await prisma.brandHistory.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      title: "ประวัติความเป็นมา",
      body: "",
    },
  });

  console.log("Seed completed:");
  console.log("  Admin:   admin@idea.local / admin1234");
  console.log("  Creator: creator@idea.local / user1234");
  console.log(`  Content: ${SEED_CONTENT.length} items`);
  console.log(`  Admin id: ${admin.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
