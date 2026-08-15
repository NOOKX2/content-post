import type { Content } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";
import { getAppPublicUrl } from "@/lib/integrations/line/env";

const MEDIA_LABEL: Record<string, string> = {
  video: "วิดีโอ",
  graphic: "กราฟิก",
  image: "รูปภาพ",
};

function publicHttpsUrl(url: string | null | undefined): string | null {
  if (!url?.startsWith("https://")) return null;
  if (url.includes("localhost")) return null;
  return url;
}

function formatThaiDate(date: string, time?: string | null): string {
  if (!date) return "—";
  const parsed = new Date(`${date}T${time || "00:00"}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    return time ? `${date} ${time}` : date;
  }
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: time ? "2-digit" : undefined,
    minute: time ? "2-digit" : undefined,
  }).format(parsed);
}

function coverImage(content: Content): string | null {
  const examples = Array.isArray(content.exampleAttachments)
    ? content.exampleAttachments.filter(
        (url): url is string => typeof url === "string"
      )
    : [];
  const attachments = Array.isArray(content.attachments)
    ? content.attachments.filter(
        (url): url is string => typeof url === "string"
      )
    : [];

  return (
    publicHttpsUrl(content.coverImage) ??
    publicHttpsUrl(examples.find((url) => url.startsWith("https://"))) ??
    publicHttpsUrl(
      attachments.find((url) => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url))
    )
  );
}

export function buildApprovalFlexMessage(content: Content) {
  const status =
    STATUS_LABELS[content.status as keyof typeof STATUS_LABELS]?.label ??
    content.status;
  const media = MEDIA_LABEL[content.mediaType] ?? content.mediaType;
  const detailUrl = `${getAppPublicUrl()}/content/${content.id}`;
  const image = coverImage(content);

  const hero = image
    ? {
        type: "image",
        url: image,
        size: "full",
        aspectRatio: "16:9",
        aspectMode: "cover",
      }
    : undefined;

  return {
    type: "flex",
    altText: `รออนุมัติ ${content.contentId} ${content.name}`,
    contents: {
      type: "bubble",
      ...(hero ? { hero } : {}),
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#F97316",
        paddingAll: "12px",
        contents: [
          {
            type: "text",
            text: "รออนุมัติ",
            color: "#FFFFFF",
            weight: "bold",
            size: "sm",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: content.name || content.contentId,
            weight: "bold",
            size: "lg",
            wrap: true,
          },
          {
            type: "box",
            layout: "baseline",
            spacing: "sm",
            contents: [
              {
                type: "text",
                text: media,
                size: "xs",
                color: "#F97316",
                weight: "bold",
              },
              {
                type: "text",
                text: content.contentId,
                size: "xs",
                color: "#8C8C8C",
                flex: 1,
              },
            ],
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "สถานะ",
                    size: "sm",
                    color: "#8C8C8C",
                    flex: 2,
                  },
                  {
                    type: "text",
                    text: status,
                    size: "sm",
                    color: "#16A34A",
                    weight: "bold",
                    flex: 5,
                    wrap: true,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "วันที่",
                    size: "sm",
                    color: "#8C8C8C",
                    flex: 2,
                  },
                  {
                    type: "text",
                    text: formatThaiDate(
                      content.scheduledDate,
                      content.scheduledTime
                    ),
                    size: "sm",
                    color: "#111111",
                    flex: 5,
                    wrap: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#F97316",
            action: {
              type: "postback",
              label: "อนุมัติ",
              data: `approve:${content.id}`,
              displayText: "อนุมัติ",
            },
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "ไม่อนุมัติ",
              data: `reject:${content.id}`,
              displayText: "ไม่อนุมัติ",
            },
          },
          {
            type: "button",
            style: "link",
            action: {
              type: "uri",
              label: "ดูรายละเอียด",
              uri: detailUrl,
            },
          },
        ],
      },
    },
  };
}
