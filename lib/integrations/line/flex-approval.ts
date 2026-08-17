import type { Content } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";
import { getAppPublicUrl } from "@/lib/integrations/line/env";

export type LineContentCardKind = "pending" | "approved" | "rejected";

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

export function lineContentCardKind(status: string): LineContentCardKind {
  if (status === "pending" || status === "clip_pending") return "pending";
  if (status === "rejected") return "rejected";
  return "approved";
}

function headerForKind(kind: LineContentCardKind) {
  if (kind === "approved") {
    return { backgroundColor: "#16A34A", text: "อนุมัติแล้ว" };
  }
  if (kind === "rejected") {
    return { backgroundColor: "#78716C", text: "ไม่อนุมัติ" };
  }
  return { backgroundColor: "#F97316", text: "รออนุมัติ" };
}

function altTextForKind(kind: LineContentCardKind, content: Content) {
  const title = `${content.contentId} ${content.name}`.trim();
  if (kind === "approved") return `อนุมัติแล้ว ${title}`;
  if (kind === "rejected") return `ไม่อนุมัติ ${title}`;
  return `รออนุมัติ ${title}`;
}

function statusColor(kind: LineContentCardKind) {
  if (kind === "rejected") return "#B91C1C";
  if (kind === "approved") return "#16A34A";
  return "#16A34A";
}

function footerForKind(kind: LineContentCardKind, content: Content) {
  const detailUrl = `${getAppPublicUrl()}/content/${content.id}`;
  const detailButton = {
    type: "button",
    style: "link",
    action: {
      type: "uri",
      label: "ดูรายละเอียด",
      uri: detailUrl,
    },
  };

  if (kind === "approved") {
    return [
      {
        type: "button",
        style: "primary",
        color: "#16A34A",
        action: {
          type: "uri",
          label: "อนุมัติแล้ว",
          uri: detailUrl,
        },
      },
      detailButton,
    ];
  }

  if (kind === "rejected") {
    return [
      {
        type: "button",
        style: "primary",
        color: "#78716C",
        action: {
          type: "uri",
          label: "ไม่อนุมัติแล้ว",
          uri: detailUrl,
        },
      },
      detailButton,
    ];
  }

  return [
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
    detailButton,
  ];
}

export function buildApprovalFlexMessage(
  content: Content,
  kind: LineContentCardKind = "pending"
) {
  const status =
    STATUS_LABELS[content.status as keyof typeof STATUS_LABELS]?.label ??
    content.status;
  const media = MEDIA_LABEL[content.mediaType] ?? content.mediaType;
  const image = coverImage(content);
  const header = headerForKind(kind);

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
    altText: altTextForKind(kind, content),
    contents: {
      type: "bubble",
      ...(hero ? { hero } : {}),
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: header.backgroundColor,
        paddingAll: "12px",
        contents: [
          {
            type: "text",
            text: header.text,
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
                    color: statusColor(kind),
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
        contents: footerForKind(kind, content),
      },
    },
  };
}
