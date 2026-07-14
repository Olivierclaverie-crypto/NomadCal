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
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return { ok: false }; }
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
      // 401 = rejet d'auth réel, pas la peine de réessayer
      const is401 = resp?.status === 401;
      if (queueable && !is401) enqueueWrite(auth.email, {op:"put", ev});
      return { ok: false, status: resp?.status };
    }
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return { ok: false }; }
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

  // ── Cache invalidation — uniquement si le PUT a réussi ────────────────────
  if (invalidateCache && auth.email) {
    const prefix = userPrefix(auth.email);
    if (prefix) localStorage.removeItem(prefix + "cf_events");
  }
  return { ok: true };
}

export async function deleteEvent(ev, auth, queueable=true) {
  if (!auth) return { ok: false };
  // Si pas de href local → cherche le vrai href via UID dans iCloud
  // Le syncCalDAV() après cette fonction récupère l'état réel
  if (!ev.href) {
    console.warn("[deleteEvent] Pas de href pour:", ev.id, "— sync forcée");
    return { ok: false }; // syncCalDAV() après va nettoyer
  }
  // ── BOÎTE D'ENVOI : hors-ligne → on range la suppression au lieu de la perdre ──
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return { ok: false }; }
  try {
    const resp = await caldavRequest("DELETE", ev.href, makeAuthHeader(auth.email, auth.appPassword));
    // 404 = déjà absent côté iCloud → exactement ce qu'on voulait, on considère ça réussi
    const ok = resp && ((resp.status >= 200 && resp.status < 300) || resp.status === 404);
    if (!ok) {
      console.error(`[deleteEvent] DELETE status=${resp?.status} path=${ev.href}`, resp?.text?.slice(0, 200));
      const is401 = resp?.status === 401;
      if (queueable && !is401) enqueueWrite(auth.email, {op:"delete", ev});
      return { ok: false, status: resp?.status };
    }
    return { ok: true };
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return { ok: false }; }
    throw e;
  }
}

// ── Édition d'UNE occurrence → EXCEPTION RFC 5545 (fonction VOISINE) ──────────
// pushEvent reste INTACTE. Ici on écrit une exception DANS la ressource du master
// (même href, même UID + RECURRENCE-ID), sans jamais écraser le master ni sa RRULE.
// Stratégie GET-modify-PUT : relire le calendar-data existant (master + exceptions
// déjà présentes), insérer/remplacer le seul VEVENT exception, puis PUT.

function buildExceptionVevent(ev) {
  const fmt = s => (s ? s.replace(/-/g, "") : "");
  const allDay = ev.allDay;
  const dtstart = allDay
    ? `DTSTART;VALUE=DATE:${fmt(ev.startDate)}`
    : `DTSTART;TZID=Europe/Paris:${fmt(ev.startDate)}T${(ev.startTime || "09:00").replace(":", "") + "00"}`;
  const dtend = allDay
    ? `DTEND;VALUE=DATE:${fmt(ev.endDate || ev.startDate)}`
    : `DTEND;TZID=Europe/Paris:${fmt(ev.endDate || ev.startDate)}T${(ev.endTime || "10:00").replace(":", "") + "00"}`;
  // RECURRENCE-ID = instant ORIGINAL de l'occurrence (heure murale locale, jamais UTC/Z)
  const recId = allDay
    ? `RECURRENCE-ID;VALUE=DATE:${ev.recurrenceId}`
    : `RECURRENCE-ID;TZID=Europe/Paris:${ev.recurrenceId}`;
  const icsStatus = ev.status === "tentative" ? "STATUS:TENTATIVE"
    : ev.status === "cancelled" ? "STATUS:CANCELLED"
    : "STATUS:CONFIRMED";
  return [
    "BEGIN:VEVENT",
    `UID:${ev.masterUid}`,                                   // UID master PUR (pas suffixé)
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    recId,
    dtstart,
    dtend,
    `SUMMARY:${ev.title}`,
    icsStatus,
    "X-RECURRENCE-EXCEPTION:True",
    ev.location ? `LOCATION:${ev.location}` : "",
    ev.email ? `URL:mailto:${ev.email}` : "",
    ev.tel ? `CONTACT:${ev.tel}` : "",
    ev.notes ? `DESCRIPTION:${ev.notes.replace(/\n/g, "\\n")}` : "",
    "END:VEVENT",                                            // AUCUNE RRULE sur une exception
  ].filter(Boolean).join("\r\n");
}

export async function pushOccurrenceException(ev, auth) {
  if (!auth || !ev.href || !ev.masterUid || !ev.recurrenceId) return { ok: false };
  if (!navigator.onLine) return { ok: false, offline: true }; // PR1 : online only

  const authHeader = makeAuthHeader(auth.email, auth.appPassword);

  // 1. GET la ressource master telle quelle (VTIMEZONE + master + exceptions existantes)
  const getResp = await caldavRequest("GET", ev.href, authHeader);
  if (!getResp || getResp.status < 200 || getResp.status >= 300 || !getResp.text) {
    console.error(`[pushOccurrenceException] GET status=${getResp?.status} href=${ev.href}`);
    return { ok: false, status: getResp?.status };
  }
  let vcal = getResp.text;

  // 2. Construit le VEVENT exception
  const exVevent = buildExceptionVevent(ev);

  // 3. Remplace le VEVENT au même RECURRENCE-ID (ré-édition) sinon insère avant END:VCALENDAR
  const ridRe = new RegExp(`RECURRENCE-ID[^\\r\\n]*:${ev.recurrenceId}(?![0-9])`);
  let replaced = false;
  vcal = vcal.replace(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g, (block) => {
    if (ridRe.test(block)) { replaced = true; return exVevent; }
    return block;                                            // master et autres exceptions : intacts
  });
  if (!replaced) {
    vcal = vcal.replace("END:VCALENDAR", `${exVevent}\r\nEND:VCALENDAR`);
  }

  // 4. PUT sur le href MASTER — master + exception(s) dans la même ressource
  const putResp = await caldavRequest("PUT", ev.href, authHeader, vcal, { "Content-Type": "text/calendar; charset=utf-8" });
  const ok = putResp && putResp.status >= 200 && putResp.status < 300;
  if (!ok) console.error(`[pushOccurrenceException] PUT status=${putResp?.status} href=${ev.href}`, putResp?.text?.slice(0, 200));
  return { ok, status: putResp?.status };
}
