import { caldavRequest } from "../utils/caldav.js";
import { makeAuthHeader, userPrefix } from "../utils/helpers.js";
import { enqueueWrite } from "./pendingQueue.js";

export async function pushEvent(ev, auth, invalidateCache=true, queueable=true) {
  if (!auth || !ev.calHref) return;
const uid = ev.id || `calflow-${Date.now()}@nomadcal`;
  const allDay = ev.allDay;
  const fmt = s => s ? s.replace(/-/g, "") : "";

  // ── TZID=Europe/Paris — RFC 5545 correct ──────────────────────────────────
  const dtstart = allDay
    ? `DTSTART;VALUE=DATE:${fmt(ev.startDate)}`
    : `DTSTART;TZID=Europe/Paris:${fmt(ev.startDate)}T${(ev.startTime||"09:00").replace(":","")+"00"}`;
  const dtend = allDay
    ? `DTEND;VALUE=DATE:${fmt(ev.endDate||ev.startDate)}`
    : `DTEND;TZID=Europe/Paris:${fmt(ev.endDate||ev.startDate)}T${(ev.endTime||"10:00").replace(":","")+"00"}`;

  // ── STATUS ICS — RFC 5545 ─────────────────────────────────────────────────
  const icsStatus = ev.status === "tentative" ? "STATUS:TENTATIVE"
    : ev.status === "cancelled" ? "STATUS:CANCELLED"
    : "STATUS:CONFIRMED";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NomadCal//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
    dtstart,
    dtend,
    `SUMMARY:${ev.title}`,
    icsStatus,
    ev.rrule&&!ev.isRecurring?`RRULE:${ev.rrule}`:"",
    ev.location?`LOCATION:${ev.location}`:"",
    ev.email?`URL:mailto:${ev.email}`:"",
    ev.tel?`CONTACT:${ev.tel}`:"",
    ev.notes?`DESCRIPTION:${ev.notes.replace(/\n/g,"\\n")}`:"",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");

const path = ev.href || (ev.calHref + uid + ".ics");
  // ── BOÎTE D'ENVOI : hors-ligne → on range l'écriture au lieu de la perdre ──
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return; }
  try {
    const resp = await caldavRequest("PUT", path, makeAuthHeader(auth.email, auth.appPassword), ics, {"Content-Type":"text/calendar; charset=utf-8"});
    const ok = resp && resp.status >= 200 && resp.status < 300;
    if (typeof window !== "undefined" && window.__showToast && window.__debugToast) {
      window.__showToast({
        type: ok ? "success" : "error",
        title: ok ? `PUT OK (${resp.status})` : `PUT échec (${resp?.status})`,
        body: `path: ${path}\n\nUID: ${uid}\n\nréponse iCloud:\n${(resp?.text || "").slice(0, 300)}`,
        duration: 0,
      });
    }
    if (!ok) {
      console.error(`[pushEvent] PUT status=${resp?.status} path=${path}`, resp?.text?.slice(0, 200));
    }
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return; }
    if (typeof window !== "undefined" && window.__showToast && window.__debugToast) {
      window.__showToast({
        type: "error",
        title: "PUT exception",
        body: `path: ${path}\n\nerreur: ${e?.message || e}`,
        duration: 0,
      });
    }
    throw e;
  }

  // ── Cache invalidation — force sync fraîche après chaque write ────────────
  if (invalidateCache && auth.email) {
    const prefix = userPrefix(auth.email);
    if (prefix) localStorage.removeItem(prefix + "cf_events");
  }
}

export async function deleteEvent(ev, auth, queueable=true) {
  if (!auth) return;
  // Si pas de href local → cherche le vrai href via UID dans iCloud
  // Le syncCalDAV() après cette fonction récupère l'état réel
  if (!ev.href) {
    console.warn("[deleteEvent] Pas de href pour:", ev.id, "— sync forcée");
    return; // syncCalDAV() après va nettoyer
  }
  // ── BOÎTE D'ENVOI : hors-ligne → on range la suppression au lieu de la perdre ──
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return; }
  try {
    await caldavRequest("DELETE", ev.href, makeAuthHeader(auth.email, auth.appPassword));
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return; }
    throw e;
  }
}
