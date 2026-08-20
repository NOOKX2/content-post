import { z } from "zod";
import type { ContentFormData } from "@/lib/types";

const platformSchema = z.enum([
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "line",
  "lemon8",
]);

export const contentFormSchema = z.object({
  name: z.string(),
  mediaType: z.enum(["video", "image", "graphic"]),
  channel: z.string(),
  platforms: z.array(platformSchema),
  postingTargets: z.array(
    z.object({
      bufferChannelId: z.string(),
      platform: platformSchema,
      name: z.string(),
    })
  ),
  details: z.string(),
  location: z.array(z.string()),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  endTime: z.string(),
  ideaFinishedDate: z.string(),
  shootDate: z.string(),
  editFinishedDate: z.string(),
  team: z.array(
    z.object({
      id: z.string(),
      participant: z.string(),
      responsibility: z.string(),
    })
  ),
  productsNeeded: z.array(z.string()),
  itemsToPrepare: z.string(),
  filmingEquipment: z.array(z.string()),
  attachments: z.array(z.string()),
  exampleAttachments: z.array(z.string()),
  coverImage: z.string(),
  script: z.array(
    z.object({
      id: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      duration: z.string().optional(),
      speaker: z.string(),
      action: z.string(),
      dialogue: z.string(),
      notes: z.string(),
      imageUrl: z.string().optional(),
    })
  ),
  ideaCreator: z.string(),
  photographer: z.string(),
  editor: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  imageMeta: z.object({
    objective: z.string(),
    headline: z.string(),
    subHead: z.string(),
    callToAction: z.string(),
    requiredElements: z.array(z.string()),
    workSizes: z.array(z.string()),
  }),
}) satisfies z.ZodType<ContentFormData>;

export type ContentFormValues = z.infer<typeof contentFormSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean(),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
  });

export const productFormSchema = z.object({
  name: z.string().trim().min(1),
  sku: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

export const profileFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  displayName: z.string(),
  phone: z.string(),
  phoneCountry: z.string(),
  position: z.string(),
  email: z.string().email(),
  imageUrl: z.string(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
  });

export const adminUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "EDITOR", "USER"]),
});

export const meetingDraftSchema = z
  .object({
    title: z.string().trim().min(1),
    meetUrl: z.string(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    path: ["endsAt"],
  });

export const calendarEventSchema = z.object({
  name: z.string().trim().min(1),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  endTime: z.string(),
  channel: z.string(),
  details: z.string(),
  ideaCreator: z.string(),
});
