/**
 * caldavCalendar.js — Gestion calendrier NomadCal sur iCloud CalDAV
 *
 * Ce module gère le calendrier dédié "NomadCal OC" dans iCloud :
 * - Création au 1er login avec accord user
 * - Création / lecture / modification / suppression des événements périodes
 * - Sync bidirectionnelle avec NomadBook
 *
 * Toutes les fonctions sont indépendantes de App.jsx et NomadBook.jsx
 */

import { caldavRequest } from './caldav.js';
import { makeAuthHeader } from './helpers.js';

// ── Constantes ────────────────────────────────────────────────────────────────
const CALDAV_BASE    = "/1012673262/calendars/";
const CAL_SUFFIX     = "nomadcal/";
const CATEGORY_TAG   = "NOMADCAL";
const RAPPORT_TAG    = "RAPPORT";
const FRAIS_TAG      = "FRAIS";
const CAL_COLOR      = "#2B5A9E";  // Bleu acier NomadCal
const ALARM_7D       = "-P7D";     // Rappel 7 jours avant
const ALARM_1D       = "-P1D";     // Rappel veille

// ── Clé localStorage pour stocker le href du calendrier ──────────────────────
const CAL_HREF_KEY   = "nomadcal_calendar_href";
const CAL_DECLINED_KEY = "nomadcal_calendar_declined_until";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Génère le nom du calendrier depuis l'email
 * olivierclaverie@me.com → "NomadCal OC"
 */
export function calendarDisplayName(email) {
  if (!email) return "NomadCal";
  const name = email.split("@")[0].replace(/[^a-z]/gi,"");
  // Prend 1ère lettre + lettre du milieu comme initiales
  const i1 = name[0]?.toUpperCase() || "";
  const i2 = name.length > 4 ? name[Math.floor(name.length/2)].toUpperCase() : "";
  return `NomadCal ${i1}${i2}`.trim();
}

/**
 * Génère le slug du calendrier depuis l'email (pour l'URL CalDAV)
 * olivierclaverie@me.com → "nomadcal-oc"
 */
function calendarSlug(email) {
  const name = email.split("@")[0].replace(/[^a-z]/gi,"").toLowerCase();
  const i1 = name[0] || "";
  const i2 = name.length > 4 ? name[Math.floor(name.length/2)] : "";
  return `nomadcal-${i1}${i2}`;
}

/**
 * Formate une date ISO en format CalDAV (YYYYMMDD pour allDay)
 */
function toCalDAVDate(iso) {
  return iso.replace(/-/g, "");
}

/**
 * Formate une date ISO en date CalDAV lendemain (pour DTEND allDay)
 */
function toCalDAVDateNext(iso) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
}

/**
 * Génère le label auto d'une période depuis la date de fin
 * "2026-06-01" → "Rapport Juin 2026"
 * Si la période chevauche 2 mois : "Rapport Juin–Juillet 2026"
 */
export function autoLabel(startISO, endISO) {
  const start = new Date(startISO + "T12:00:00");
  const end   = new Date(endISO   + "T12:00:00");
  const mStart = start.toLocaleDateString("fr-FR", { month: "long" });
  const mEnd   = end.toLocaleDateString("fr-FR",   { month: "long" });
  const year   = end.getFullYear();
  const cap    = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (mStart === mEnd) return `Rapport ${cap(mEnd)} ${year}`;
  return `Rapport ${cap(mStart)}–${cap(mEnd)} ${year}`;
}

/**
 * Génère le contenu ICS d'un event période
 */
function buildPeriodICS({ uid, label, startISO, endISO, periodStart, rrule, noteCount, calName, appUrl }) {
  const dtstart  = toCalDAVDate(endISO);
  const dtend    = toCalDAVDateNext(endISO);
  const dtstamp  = new Date().toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";
  const desc     = [
    `📅 Période : ${periodStart} → ${endISO}`,
    `📓 Ouvrir NomadBook → ${appUrl || "https://cal-flow-jade.vercel.app"}`,
    noteCount != null ? `📊 Notes saisies : ${noteCount}` : "",
  ].filter(Boolean).join("\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NomadCal//FR",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${label}`,
    `DESCRIPTION:${desc}`,
    `CATEGORIES:${CATEGORY_TAG},${RAPPORT_TAG}`,
    `COLOR:${CAL_COLOR}`,
    rrule ? `RRULE:${rrule}` : "",
    // Alarme 7 jours avant
    "BEGIN:VALARM",
    `TRIGGER:${ALARM_7D}`,
    "ACTION:DISPLAY",
    "DESCRIPTION:Rapport à compiler dans 7 jours !",
    "END:VALARM",
    // Alarme veille
    "BEGIN:VALARM",
    `TRIGGER:${ALARM_1D}`,
    "ACTION:DISPLAY",
    "DESCRIPTION:Rapport à compiler demain !",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  return lines;
}

// ── Fonctions principales ─────────────────────────────────────────────────────

/**
 * Récupère le href du calendrier NomadCal depuis localStorage
 * ou le reconstruit depuis l'email
 */
export function getCalendarHref(email) {
  const stored = localStorage.getItem(CAL_HREF_KEY);
  if (stored) return stored;
  // Reconstruit depuis email si absent
  return `${CALDAV_BASE}${calendarSlug(email)}/`;
}

/**
 * Vérifie si le calendrier NomadCal existe dans iCloud
 * Retourne true si trouvé
 */
export async function checkCalendarExists(auth) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    const { text } = await caldavRequest(
      "PROPFIND",
      CALDAV_BASE,
      authHeader,
      `<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:a="http://apple.com/ns/ical/"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>`,
      { Depth: "1" }
    );
    const calName = calendarDisplayName(auth.email);
    const slug    = calendarSlug(auth.email);
    // Cherche par href stocké OU par slug OU par displayName
    const storedHref = localStorage.getItem(CAL_HREF_KEY);
    return (
      (storedHref && text.includes(storedHref)) ||
      text.includes(slug) ||
      text.includes(calName)
    );
  } catch {
    return false;
  }
}

/**
 * Crée le calendrier NomadCal dans iCloud
 * Retourne { success, error }
 */
export async function createCalendar(auth) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    const slug       = calendarSlug(auth.email);
    const calHref    = `${CALDAV_BASE}${slug}/`;
    const calName    = calendarDisplayName(auth.email);

    const body = [
      `<?xml version="1.0" encoding="utf-8"?>`,
      `<c:mkcalendar xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:a="http://apple.com/ns/ical/">`,
      `<d:set><d:prop>`,
      `<d:displayname>${calName}</d:displayname>`,
      `<c:calendar-description>Calendrier NomadCal — Rapports et Frais</c:calendar-description>`,
      `<a:calendar-color>${CAL_COLOR}</a:calendar-color>`,
      `<c:supported-calendar-component-set><c:comp name="VEVENT"/></c:supported-calendar-component-set>`,
      `</d:prop></d:set>`,
      `</c:mkcalendar>`,
    ].join("");

    await caldavRequest("MKCALENDAR", calHref, authHeader, body, {
      "Content-Type": "application/xml; charset=utf-8",
    });

    // Stocke le href pour les prochaines fois
    localStorage.setItem(CAL_HREF_KEY, calHref);
    return { success: true, href: calHref };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Vérifie ou crée le calendrier NomadCal
 * Retourne { exists, created, error, declined }
 */
export async function checkOrCreateCalendar(auth) {
  // Vérifie si user a décliné récemment (pendant 24h)
  const declinedUntil = localStorage.getItem(CAL_DECLINED_KEY);
  if (declinedUntil && Date.now() < parseInt(declinedUntil)) {
    return { exists: false, declined: true };
  }

  const exists = await checkCalendarExists(auth);
  if (exists) return { exists: true };

  return { exists: false, needsCreation: true };
}

/**
 * Marque que l'user a décliné — rappel dans 24h
 */
export function declineCalendarCreation() {
  const until = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem(CAL_DECLINED_KEY, String(until));
}

/**
 * Crée un event période dans le calendrier NomadCal
 * Retourne { success, href, uid }
 */
export async function createPeriodEvent(auth, { startISO, endISO, label, rrule, noteCount }) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    const calHref    = getCalendarHref(auth.email);
    const uid        = `nomadcal-rapport-${Date.now()}@nomadcal`;
    const fileName   = `rapport-${endISO}.ics`;
    const eventHref  = `${calHref}${fileName}`;
    const autoLbl    = label || autoLabel(startISO, endISO);

    const ics = buildPeriodICS({
      uid,
      label:       autoLbl,
      startISO:    endISO,      // DTSTART = date fin (jour complet)
      endISO:      endISO,
      periodStart: startISO,    // dans DESCRIPTION
      rrule,
      noteCount,
      calName:     calendarDisplayName(auth.email),
      appUrl:      "https://cal-flow-jade.vercel.app",
    });

    await caldavRequest("PUT", eventHref, authHeader, ics, {
      "Content-Type": "text/calendar; charset=utf-8",
    });

    return { success: true, href: eventHref, uid, label: autoLbl };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Met à jour un event période existant
 * Retourne { success, error }
 */
export async function updatePeriodEvent(auth, href, { startISO, endISO, label, rrule, noteCount, uid }) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    // UID PRÉSERVÉ (transmis par l'appelant). Ne plus le dériver du basename du href :
    // c'était la source de la bascule d'identité période↔note (bug notes invisibles).
    const autoLbl    = label || autoLabel(startISO, endISO);

    const ics = buildPeriodICS({
      uid,
      label:       autoLbl,
      startISO:    endISO,
      endISO:      endISO,
      periodStart: startISO,
      rrule,
      noteCount,
      appUrl:      "https://cal-flow-jade.vercel.app",
    });

    await caldavRequest("PUT", href, authHeader, ics, {
      "Content-Type": "text/calendar; charset=utf-8",
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Supprime un event période
 * Retourne { success, error }
 */
export async function deletePeriodEvent(auth, href) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    await caldavRequest("DELETE", href, authHeader);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Lit tous les events période depuis le calendrier NomadCal
 * Retourne tableau de périodes : { uid, href, label, startISO, endISO, rrule }
 */
export async function getPeriodEvents(auth) {
  try {
    const authHeader = makeAuthHeader(auth.email, auth.appPassword);
    const calHref    = getCalendarHref(auth.email);

    const since  = new Date(); since.setFullYear(since.getFullYear() - 2);
    const until  = new Date(); until.setFullYear(until.getFullYear() + 2);
    const sinceStr = since.toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";
    const untilStr = until.toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";

    const { text } = await caldavRequest(
      "REPORT",
      calHref,
      authHeader,
      `<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${sinceStr}" end="${untilStr}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`,
      { Depth: "1", "Content-Type": "application/xml" }
    );

    return parsePeriodEvents(text);
  } catch {
    return [];
  }
}

/**
 * Parse le XML CalDAV pour extraire les events période
 */
function parsePeriodEvents(xml) {
  const periods = [];
  const responseBlocks = xml.split("<response>").slice(1);

  responseBlocks.forEach(block => {
    // Filtre sur CATEGORIES contenant RAPPORT
    if (!block.includes(RAPPORT_TAG)) return;

    // Extrait href
    const hrefMatch = block.match(/<href>([^<]+)<\/href>/);
    if (!hrefMatch) return;
    const href = hrefMatch[1];

    // Extrait calendar-data
    const dataMatch = block.match(/<cal:calendar-data[^>]*>([\s\S]*?)<\/cal:calendar-data>/) ||
                      block.match(/<calendar-data[^>]*>([\s\S]*?)<\/calendar-data>/);
    if (!dataMatch) return;
    const ics = dataMatch[1];

    // Parse ICS
    const getVal = key => {
      const m = ics.match(new RegExp(`${key}[^:]*:([^\\r\\n]+)`));
      return m ? m[1].trim() : null;
    };

    const summary  = getVal("SUMMARY");
    const dtstart  = getVal("DTSTART");
    const rrule    = getVal("RRULE");
    const uid      = getVal("UID");
    const desc     = getVal("DESCRIPTION") || "";

    // Extrait date début période depuis DESCRIPTION
    const periodStartMatch = desc.match(/Période : ([0-9-]+) →/);
    const periodStart = periodStartMatch ? periodStartMatch[1] : null;

    // Convertit DTSTART (YYYYMMDD) → ISO (YYYY-MM-DD)
    const endISO = dtstart
      ? `${dtstart.slice(0,4)}-${dtstart.slice(4,6)}-${dtstart.slice(6,8)}`
      : null;

    if (!summary || !endISO) return;

    periods.push({
      uid,
      href,
      label:    summary,
      startISO: periodStart,
      endISO,
      rrule:    rrule || null,
    });
  });

  // Trie par date de fin croissante
  return periods.sort((a,b) => (a.endISO||"").localeCompare(b.endISO||""));
}

/**
 * Met à jour le nombre de notes d'une période dans son event CalDAV
 * Appelé à chaque ajout/suppression de note dans NomadBook
 */
export async function syncNoteCount(auth, href, { startISO, endISO, label, rrule, noteCount, uid }) {
  return updatePeriodEvent(auth, href, { startISO, endISO, label, rrule, noteCount, uid });
}
