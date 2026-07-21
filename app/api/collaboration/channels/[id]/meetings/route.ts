import { NextResponse } from "next/server";
import { requireSession } from "@/lib/content/api-auth";
import {
  assertCanAccessChannel,
  getChannelAttendees,
  listChannelMeetings,
  postMeetingMessage,
} from "@/lib/collaboration/service";
import {
  createCalendarMeeting,
  isGoogleCalendarConfigured,
} from "@/lib/google/calendar";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;

  try {
    const meetings = await listChannelMeetings(
      id,
      authResult.session.user.id
    );
    return NextResponse.json({ meetings });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "โหลดปฏิทินห้องไม่สำเร็จ",
      },
      { status: error instanceof Error && error.message.includes("สิทธิ์") ? 403 : 400 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireSession();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const allowed = await assertCanAccessChannel(
    id,
    authResult.session.user.id
  );
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as {
    title?: string;
    meetUrl?: string;
    startsAt?: string;
    endsAt?: string;
  };

  if (!payload.title?.trim()) {
    return NextResponse.json(
      { error: "กรุณากรอกหัวข้อประชุม" },
      { status: 400 }
    );
  }
  if (!payload.startsAt || !payload.endsAt) {
    return NextResponse.json(
      { error: "กรุณาเลือกเวลาเริ่มและสิ้นสุด" },
      { status: 400 }
    );
  }

  const title = payload.title.trim();
  let meetUrl = payload.meetUrl?.trim() ?? "";
  let eventId = "";
  let calendarLink = "";
  let attendeeCount = 0;

  if (isGoogleCalendarConfigured()) {
    try {
      const attendees = await getChannelAttendees(id);
      attendeeCount = attendees.length;
      const created = await createCalendarMeeting({
        title,
        description: `นัดประชุมโดย ${authResult.session.user.name ?? "ผู้ใช้"}`,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt,
        attendees: attendees.map((attendee) => ({
          email: attendee.email,
          displayName: attendee.name,
        })),
        manualMeetUrl: meetUrl || undefined,
      });
      meetUrl = created.meetUrl;
      eventId = created.eventId;
      calendarLink = created.htmlLink;
    } catch (error) {
      console.error("[meetings] Failed to create calendar event", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? `สร้างนัดใน Google Calendar ไม่สำเร็จ: ${error.message}`
              : "สร้างนัดใน Google Calendar ไม่สำเร็จ",
        },
        { status: 502 }
      );
    }
  }

  const message = await postMeetingMessage({
    channelId: id,
    authorId: authResult.session.user.id,
    authorName: authResult.session.user.name ?? "ผู้ใช้",
    title,
    meetUrl,
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    eventId,
    calendarLink,
    attendeeCount,
  });

  return NextResponse.json({
    message: {
      id: message.id,
      channelId: message.channelId,
      authorId: message.authorId,
      authorName: message.authorName,
      body: message.body,
      messageType: message.messageType,
      metadata: message.metadata as Record<string, unknown>,
      createdAt: message.createdAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      deletedAt: message.deletedAt?.toISOString() ?? null,
    },
  });
}
