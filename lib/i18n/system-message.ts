import type { TFunction } from "./translate";

const PATTERNS: Array<{
  re: RegExp;
  key: string;
  vars: (match: RegExpMatchArray) => Record<string, string>;
}> = [
  {
    re: /^(.+) ส่งแนวคิด (\S+) เข้าสู่ขั้นตอนอนุมัติ$/,
    key: "team.sysSendIdeaStep",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) ส่งคลิป (\S+) เข้าสู่ขั้นตอนอนุมัติ$/,
    key: "team.sysSendClipStep",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) ส่งแนวคิด (\S+) เพื่ออนุมัติ$/,
    key: "team.sysSendIdea",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) ส่งคลิป (\S+) เพื่ออนุมัติ$/,
    key: "team.sysSendClip",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) อนุมัติแนวคิด (\S+) แล้ว — รออัปโหลดคลิป$/,
    key: "team.sysIdeaApproved",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) อนุมัติ (\S+) แล้ว$/,
    key: "team.sysApproved",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) ส่งกลับแก้ไข (\S+): (.+)$/,
    key: "team.sysRejectedNote",
    vars: (match) => ({ name: match[1], id: match[2], note: match[3] }),
  },
  {
    re: /^(.+) ส่งกลับแก้ไข (\S+)$/,
    key: "team.sysRejected",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^(.+) อัปเดตรายละเอียด (\S+)$/,
    key: "team.sysUpdated",
    vars: (match) => ({ name: match[1], id: match[2] }),
  },
  {
    re: /^คำขออนุมัติแนวคิด: (\S+) — (.+)$/,
    key: "team.sysApprovalIdea",
    vars: (match) => ({ id: match[1], name: match[2] }),
  },
  {
    re: /^คำขออนุมัติคลิป: (\S+) — (.+)$/,
    key: "team.sysApprovalClip",
    vars: (match) => ({ id: match[1], name: match[2] }),
  },
];

export function translateStoredMessage(body: string, t: TFunction): string {
  if (!body) return body;
  if (body === "คำขออนุมัติ Content") return t("team.sysApprovalContent");

  for (const pattern of PATTERNS) {
    const match = body.match(pattern.re);
    if (match) return t(pattern.key, pattern.vars(match));
  }

  return body;
}
