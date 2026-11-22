import { WEDDING_CONFIG } from "@/config/wedding";

function formatUtcForCalendar(date: Date): string {
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

export function getGoogleCalendarUrl(): string {
  const start = new Date(WEDDING_CONFIG.schedule.isoDateTime);
  const end = new Date(
    start.getTime() + WEDDING_CONFIG.schedule.durationMinutes * 60 * 1000
  );
  const title = `${WEDDING_CONFIG.couple.groom.koreanName} ♥ ${WEDDING_CONFIG.couple.bride.koreanName} 결혼식`;
  const details = `${WEDDING_CONFIG.schedule.displayFullKo}\n${WEDDING_CONFIG.venue.fullDisplayName}\n${WEDDING_CONFIG.venue.roadAddress}`;
  const location = WEDDING_CONFIG.venue.roadAddress;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatUtcForCalendar(start)}/${formatUtcForCalendar(end)}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadWeddingIcs(): void {
  const start = new Date(WEDDING_CONFIG.schedule.isoDateTime);
  const end = new Date(
    start.getTime() + WEDDING_CONFIG.schedule.durationMinutes * 60 * 1000
  );
  const summary = `${WEDDING_CONFIG.couple.groom.koreanName} ♥ ${WEDDING_CONFIG.couple.bride.koreanName} 결혼식`;
  const location = `${WEDDING_CONFIG.venue.fullDisplayName}, ${WEDDING_CONFIG.venue.roadAddress}`;
  const description = `${WEDDING_CONFIG.schedule.displayFullKo} - ${WEDDING_CONFIG.venue.fullDisplayName}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HominEunjung//WeddingInvitation//KO",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:wedding-20270328-homin-eunjung@invitation`,
    `DTSTAMP:${formatUtcForCalendar(new Date())}`,
    `DTSTART:${formatUtcForCalendar(start)}`,
    `DTEND:${formatUtcForCalendar(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "이호민_김은정_결혼식_20270328.ics";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
