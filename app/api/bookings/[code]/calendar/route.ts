import { addDays } from "@/lib/booking/dates";
import { getGuestBooking } from "@/lib/booking/service";
import { site } from "@/lib/content/site";
import { getTour } from "@/lib/content/tours";

const escapeIcs = (value: string) => value.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
const icsDate = (date: string) => date.replaceAll("-", "");

/** Downloadable all-day .ics event for a booked tour. */
export async function GET(request: Request, { params }: RouteContext<"/api/bookings/[code]/calendar">) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const view = await getGuestBooking(code, token);
  if (!view || view.booking.status !== "confirmed") return new Response("Not found", { status: 404 });

  const { booking, departure } = view;
  const tour = getTour(booking.tourSlug);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${site.name}//Booking//EN`,
    "BEGIN:VEVENT",
    `UID:${booking.code}@booking`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${icsDate(departure.startDate)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(departure.endDate, 1))}`,
    `SUMMARY:${escapeIcs(`${site.name} · ${tour?.name[booking.locale] ?? ""} (${booking.code})`)}`,
    `LOCATION:${escapeIcs(site.airport[booking.locale])}`,
    `DESCRIPTION:${escapeIcs(`${site.location[booking.locale]} — ${booking.code}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.code}.ics"`,
    },
  });
}
