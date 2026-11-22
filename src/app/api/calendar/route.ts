import { NextResponse } from "next/server";
import { WEDDING_CONFIG } from "@/config/wedding";

function formatUtc(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    "Z"
  );
}

export async function GET() {
  const start = new Date(WEDDING_CONFIG.schedule.isoDateTime);
  const end = new Date(
    start.getTime() + WEDDING_CONFIG.schedule.durationMinutes * 60 * 1000
  );

  const summary = `${WEDDING_CONFIG.couple.groom.koreanName} ♥ ${WEDDING_CONFIG.couple.bride.koreanName} 결혼식`;
  const location = `${WEDDING_CONFIG.venue.fullDisplayName}, ${WEDDING_CONFIG.venue.roadAddress}`;
  const description = `${WEDDING_CONFIG.schedule.displayFullKo}\\n${WEDDING_CONFIG.venue.fullDisplayName}\\n${WEDDING_CONFIG.venue.roadAddress}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HominEunjung//WeddingInvitation//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:wedding-20270328-homin-eunjung@invitation.minnote.net",
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:내일은 ${summary} 날입니다.`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="homin-eunjung-wedding.ics"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
